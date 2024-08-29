import * as React from 'react'
import { LivePersona } from '@pnp/spfx-controls-react/lib/LivePersona'
import { Persona } from 'office-ui-fabric-react/lib/Persona'
import { ServiceScope } from '@microsoft/sp-core-library'

export interface IEmployeePersonaProps {
  title: string
  email: string
  teskilatvahidi: string
  serviceScope: ServiceScope
}

const EmployeePersona: React.FC<IEmployeePersonaProps> = ({
  title,
  email,
  teskilatvahidi,
  serviceScope,
}) => {
  return (
    <div>
      <LivePersona
        upn={email}
        template={
          <Persona text={title} secondaryText={teskilatvahidi} coinSize={35} />
        }
        serviceScope={serviceScope}
      />
    </div>
  )
}

export default EmployeePersona
