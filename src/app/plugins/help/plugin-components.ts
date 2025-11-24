import { ProjectSelection } from '@/features/app-bar/components/project-selection/project-selection';
import { DiagramContainer } from '@/features/diagram/diagram';
import {
  hasRegisteredComponentDecorator,
  registerComponentDecorator,
} from '@/features/plugins-core/adapters/adapter-components';
import { registerFunctionDecorator } from '@/features/plugins-core/adapters/adapter-functions';
import { PropertiesBar } from '@/features/properties-bar/components/properties-bar/properties-bar';
import { getAppBarButton } from './components/app-bar/get-app-bar-button';
import { FooterSupportButton } from './components/footer-support-button';
import { addItemsToDots } from './functions/add-items-to-dots';

registerComponentDecorator('OptionalFooterContent', {
  content: FooterSupportButton,
  place: 'after',
});

registerFunctionDecorator('getControlsDotsItems', {
  callback: addItemsToDots,
  place: 'after',
  priority: 10,
});

/*
  This plugin checks whether those buttons are already registered
  to avoid rendering hints about features that have been added to the project.
*/
if (hasRegisteredComponentDecorator('OptionalAppBarTools', 'UndoRedo') === false) {
  registerComponentDecorator('OptionalAppBarTools', {
    content: getAppBarButton('ArrowUUpLeft', 'plugins.help.tooltipUndo'),
    place: 'after',
  });

  registerComponentDecorator('OptionalAppBarTools', {
    content: getAppBarButton('ArrowUUpRight', 'plugins.help.tooltipRedo'),
    place: 'after',
  });
}

if (hasRegisteredComponentDecorator('OptionalAppBarControls', 'ElkLayout') === false) {
  registerComponentDecorator('OptionalAppBarControls', {
    content: getAppBarButton('TreeStructureDown', 'plugins.help.tooltipElk'),
    place: 'before',
  });
}
