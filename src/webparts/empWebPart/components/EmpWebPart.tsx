import * as React from 'react';
import styles from './EmpWebPart.module.scss';
import type { IEmpWebPartProps } from './IEmpWebPartProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class EmpWebPart extends React.Component<IEmpWebPartProps, {}> {
  public render(): React.ReactElement<IEmpWebPartProps> {
    const {
      description,
      hasTeamsContext,
    } = this.props;

    return (
      <section className={`${styles.empWebPart} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <div>Web part property value: <strong>{escape(description)}</strong></div>
        </div>
      </section>
    );
  }
}
