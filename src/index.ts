import Events from './util/events';
import Settings from './settings';
import Comments from './comments';
import User from './user';

import './styles/pr0linker.scss';

const settings = new Settings();
new Comments(settings);
new User(settings);
Events.register();