import Events from './util/events';
import { Renderer } from './renderer';
import Settings from './settings';
import Comments from './comments';

import './styles/pr0linker.scss';

Renderer.init();
const settings = new Settings();
new Comments(settings);

Events.register();