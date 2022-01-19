const stubs = [
  {
    id: 'folder-0',
    name: 'New Folder',
    open: false,
    stubs: [],
  },
  {
    id: 'folder-1',
    name: 'Calvin',
    open: true,
    stubs: [
      {
        delay: 0,
        headers: {},
        id: 'stub-0',
        method: 'GET',
        name: 'asdf',
        regex: false,
        response: '',
        status: 200,
        statusText: '',
        url: 'asdf',
      },
      {
        delay: 0,
        headers: {},
        id: 'stub-1',
        method: 'PUT',
        name: 'zxcv',
        regex: false,
        request: 'heyayeayeay',
        response: '{"json":true}',
        status: 200,
        statusText: '',
        url: 'zxcv',
      },
      {
        delay: 0,
        headers: {},
        id: 'stub-2',
        method: 'POST',
        name: 'qwer',
        regex: false,
        response: '',
        status: 200,
        statusText: '',
        url: 'qwer',
      },
    ],
  },
];

export default stubs;
