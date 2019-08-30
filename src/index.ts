import Events from './util/events';
import { Renderer } from './renderer';
import Settings from './settings';

import './styles/pr0linker.scss';

Events.register();
Renderer.init();
new Settings();