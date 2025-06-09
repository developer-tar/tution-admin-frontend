import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'nhhwopastx5h8wvkds1t',
  wsHost: 'localhost',
  wsPort: 8080,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  cluster: 'mt1',
  authEndpoint: 'http://localhost:8000/broadcasting/auth',  // <== Laravel backend URL here
  withCredentials: true,
});


export default echo;
