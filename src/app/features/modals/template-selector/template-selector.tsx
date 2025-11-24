import { Tile } from './components/tile';
import { DiagramModel } from '@/types/common';
import clsx from 'clsx';
import styles from './template-selector.module.css';
import useStore from '@/store/store';
import { templates } from '@/data/templates';
import { useCallback } from 'react';
import { closeModal } from '../stores/use-modal-store';
import { useFitView } from '@/hooks/use-fit-view';

export function TemplateSelector() {
  const setDiagramModel = useStore((store) => store.setDiagramModel);
  const fitView = useFitView();

  const selectTemplate = useCallback(
    (model?: DiagramModel) => {
      setDiagramModel(model);
      fitView();
      closeModal();
    },
    [setDiagramModel, fitView],
  );

  return (
    <div className={styles['container']}>
      <section className={styles['header']}>
        <span className={clsx('ax-public-p10', styles['sub-title'])}>
          Select a template to get started or start with an empty canvas.
        </span>
      </section>
      <section className={styles['content']}>
        <div className={styles['templates']}>
          {templates.map(({ icon, id, name, value }) => (
            <Tile
              icon={icon}
              key={id}
              title={name}
              subTitle={`${value.diagram.nodes.length} nodes`}
              onClick={() => selectTemplate(value)}
            />
          ))}
          <Tile icon="CornersOut" title="Empty Canvas" outlined={true} onClick={selectTemplate} />
        </div>
      </section>
    </div>
  );
}
