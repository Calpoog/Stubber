import { useState, useEffect, useRef } from 'react';
import { Textbox, Select, Checkbox } from '../Forms';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addStub, editStub } from '../../store/reducers/stubs';
import { moveStub } from '../../store/reducers/folders';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-one_dark';

import * as styles from './StubForm.module.scss';
import classNames from 'classnames';
import store from '../../store/store';

export default function StubForm() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  let stub = useSelector((state) => state.stubs[id]) || {};
  const folders = useSelector((state) => state.folders.byHash);
  const query = new URLSearchParams(window.location.hash.split('?')[1]);
  const folderID = query.get('folderID') || stub.folderID;
  const dupe = history.location.pathname.includes('/dupe/');
  const isEditing = !!id && !dupe;

  const logID = query.get('log');
  const log = logID ? { ...store.getState().logs.byHash[logID] } : {};
  delete log.redirected;
  delete log.fetch;
  stub = { ...stub, ...log };

  const body = useRef(stub.response || '');
  const [language, setLanguage] = useState(guessLanguage(stub.headers?.['content-type'] || ''));

  // stubbing vs. redirecting
  const [isStubbing, setIsStubbing] = useState(!stub.redirectURL);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // while stubbing: editing body vs. editing headers
  const [isBody, setIsBody] = useState(true);

  const defaultValues = {
    folderID,
    method: 'GET',
    status: '200',
    ...stub,
  };
  defaultValues.headers &&= Object.entries(defaultValues.headers).map(([key, value]) => ({ key, value }));

  const methods = useForm({
    defaultValues,
  });

  const {
    fields: headersFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: methods.control,
    name: 'headers',
  });

  useEffect(() => {
    document.getElementById('name').focus();
  }, []); // only on mount

  function onSubmit(form) {
    form = { ...form, response: body.current };
    const newFolderID = form.folderID;
    setIsSubmitted(true);

    form.headers = form.headers.reduce(
      (headers, { key, value }) => (key !== '' ? { ...headers, [key]: value } : headers),
      {}
    );
    form.delay ||= 0;

    if (isStubbing) {
      delete form.redirectURL;
    } else {
      delete form.response;
      delete form.headers;
    }

    if (isEditing) {
      dispatch(editStub(form));

      if (folderID !== newFolderID) {
        dispatch(moveStub(folderID, newFolderID, id));
      }
    } else {
      dispatch(addStub(form));
    }

    console.log(form);

    history.goBack();
  }

  function validateRegex(value) {
    if (!methods.getValues().regex) return true;

    try {
      new RegExp(value);
    } catch ({ message }) {
      return message;
    }

    return true;
  }

  return (
    <>
      <header>
        <button className="backButton" onClick={history.goBack}></button>
        <h1>{isEditing ? 'Edit' : 'New'} stub</h1>
      </header>
      <div className="surface p-3">
        <FormProvider {...methods}>
          <form className="stubform" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-6 mb-3">
                <label htmlFor="name">Name</label>
                <Textbox type="text" options={{ required: 'Required' }} id="name" name="name" />
              </div>
              <div className="col-6 mb-3">
                <label htmlFor="folder">Folder</label>
                <Select id="folderID" name="folderID">
                  {Object.keys(folders).map((key) => (
                    <option key={key} value={key}>
                      {folders[key].name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label htmlFor="method">Request</label>
                <div className={styles.urlBar}>
                  <Select id="method" name="method">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </Select>
                  <Textbox
                    className="url"
                    id="url"
                    name="url"
                    options={{
                      required: 'Required',
                      validate: validateRegex,
                    }}
                  />
                </div>
              </div>
              <div className="col-auto d-flex flex-column align-items-center">
                <label htmlFor="regex">RegEx</label>
                <div className="pt-2">
                  <Checkbox
                    name="regex"
                    id="regex"
                    onChange={() => {
                      if (isSubmitted) methods.triggerValidation();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={classNames(styles.bottom, 'mt-3', 'pt-3')}>
              <div className="row mb-3">
                <div className="col-6">
                  <label>Response</label>
                  <div className={styles.toggler}>
                    <label
                      onClick={() => setIsStubbing(true)}
                      className={classNames({ [styles.selected]: isStubbing })}
                    >
                      <div className="icon stubbed"></div>
                      Stubbed
                    </label>
                    <label
                      onClick={() => setIsStubbing(false)}
                      className={classNames({ [styles.selected]: !isStubbing })}
                    >
                      <div className="icon redirect"></div>
                      Redirect
                    </label>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row">
                    <div className="col-auto">
                      <label htmlFor="status">Status code</label>
                      <Textbox
                        className={styles.code}
                        type="number"
                        options={{
                          required: 'Required',
                          min: { value: 100, message: 'Invalid' },
                          max: { value: 599, message: 'Invalid' },
                          valueAsNumber: true,
                        }}
                        id="status"
                        name="status"
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="statusText">Status text</label>
                      <Textbox id="statusText" name="statusText" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Redirect URL */}
              <div style={{ display: !isStubbing ? 'block' : 'none' }}>
                <label htmlFor="redirectURL">Redirect URL</label>
                <Textbox
                  type="text"
                  options={{
                    validate: (value) => isStubbing || value.length > 0 || 'Required',
                  }}
                  id="redirectURL"
                  name="redirectURL"
                />
                <p className={classNames(styles.helperText, 'mt-2')}>
                  You can use {'{}'} to substitute pieces of the original url: href, protocol, host, hostname, port,
                  pathname, search, hash, origin, and numbers for capture groups of a RegEx request url.
                </p>
              </div>

              {/* Stubbing */}
              <div className={classNames(styles.responseTabs, isStubbing ? 'd-block' : 'd-none')}>
                <div className={styles.toggler}>
                  <label onClick={() => setIsBody(true)} className={classNames({ [styles.selected]: isBody })}>
                    Body
                  </label>
                  <label onClick={() => setIsBody(false)} className={classNames({ [styles.selected]: !isBody })}>
                    Headers
                  </label>
                  {isBody && (
                    <div className={styles.language}>
                      {language}
                      <select
                        name="language"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="Text">Text</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="JSON">JSON</option>
                        <option value="HTML">HTML</option>
                        <option value="XML">XML</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className={classNames(isBody ? 'd-block' : 'd-none')}>
                  <div className={styles.editor}>
                    <AceEditor
                      mode={language.toLowerCase()}
                      theme="one_dark"
                      defaultValue={stub.response}
                      width="100%"
                      height="300px"
                      setOptions={{ useWorker: false, showPrintMargin: false }}
                      onChange={(code) => (body.current = code)}
                      onLoad={(editor) => {
                        editor.renderer.setPadding(10);
                        editor.renderer.setScrollMargin(10);
                      }}
                    />
                  </div>
                  {/* <Textbox type="textarea" id="response" name="response" /> */}
                </div>
                <div className={classNames(!isBody ? 'd-block' : 'd-none')}>
                  <div className={styles.headers}>
                    {headersFields.map((field, index) => (
                      <div className={styles.entry} key={field.id}>
                        <div className="row">
                          <div className="col-6">
                            <input type="text" {...methods.register(`headers.${index}.key`)} />
                          </div>
                          <div className="col-6">
                            <input
                              className={styles.entryValue}
                              type="text"
                              {...methods.register(`headers.${index}.value`)}
                            />
                          </div>
                        </div>
                        <button onClick={() => removeHeader(index)} className={styles.deleteEntry}></button>
                      </div>
                    ))}
                    <div
                      className={classNames('row', styles.addEntry)}
                      onClick={() => appendHeader({ key: '', value: '' })}
                    >
                      <div className="col-6">Key</div>
                      <div className="col-6">Value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row align-items-end mt-3">
              <div className="col">
                <label htmlFor="delay">Delay (seconds)</label>
                <Textbox
                  className={styles.delay}
                  type="number"
                  id="delay"
                  name="delay"
                  options={{ valueAsNumber: true }}
                />
              </div>
              <div className="col-auto">
                <button className={styles.submit} type="submit">
                  {isEditing ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
}

function guessLanguage(contentType) {
  contentType = contentType.toLowerCase();
  if (contentType.includes('javascript')) return 'JavaScript';
  if (contentType.includes('html')) return 'HTML';
  if (contentType.includes('xml')) return 'XML';
  if (contentType.includes('json')) return 'JSON';
  return 'Text';
}
