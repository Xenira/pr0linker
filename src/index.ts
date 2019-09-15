import Events from './util/events';
import Settings from './settings';
import Comments from './comments';

import './styles/pr0linker.scss';

const settings = new Settings();
new Comments(settings);
Events.register();