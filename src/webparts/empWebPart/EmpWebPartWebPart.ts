import { Version } from '@microsoft/sp-core-library'
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane'
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base'
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http'
import * as strings from 'EmpWebPartWebPartStrings'
import styles from './components/EmpWebPart.module.scss'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import EmployeePersona from './components/LivePersonaComponent'
import { sp } from '@pnp/sp/presets/all'

export interface IEmployeedataWebPartProps {
  description: string
}

export interface IEmployee {
  Title: string
  isnomresi: string
  TeskilatVahidi: string
  StatVezifesi: string
  KooperatifMail: string
}

export default class EmployeedataWebPart extends BaseClientSideWebPart<IEmployeedataWebPartProps> {
  private employees: IEmployee[] = []

  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      sp.setup(this.context as any)
    })
  }

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.searchContainer}">
        <input type="text" id="searchInput" placeholder="Axtarış..." class="${styles.searchBox}" />
        <button id="searchOptionsButton" class="${styles.searchOptionsButton}">Seçimlər</button>
        <div id="searchOptionsDropdown" class="${styles.searchOptionsDropdown}">
          <label>
            <input type="radio" name="searchOption" value="Title" checked /> Ad İlə
          </label>
          <label>
            <input type="radio" name="searchOption" value="TeskilatVahidi" /> Təşkilat Vahidi İlə
          </label>
          <label>
            <input type="radio" name="searchOption" value="StatVezifesi" /> Ştat Vəzifəsi İlə
          </label>
          <label>
            <input type="radio" name="searchOption" value="KooperatifMail" /> Kooperativ Mail ilə
          </label>
        </div>
      </div>
      <div id="employeeContainer" class="${styles.employeeGrid}"></div>
    `
    this._getEmployeeData().then((employees) => {
      this.employees = employees
      this._renderEmployeeList(employees)
    })

    this._setSearchEventListener()
    this._setSearchOptionsListener()
  }

  private _setSearchOptionsListener(): void {
    const searchOptionsButton: HTMLElement = this.domElement.querySelector(
      '#searchOptionsButton'
    ) as HTMLElement
    const searchOptionsDropdown: HTMLElement = this.domElement.querySelector(
      '#searchOptionsDropdown'
    ) as HTMLElement

    searchOptionsButton.addEventListener('click', () => {
      if (searchOptionsDropdown.classList.contains(styles.show)) {
        searchOptionsDropdown.classList.remove(styles.show)
      } else {
        searchOptionsDropdown.classList.add(styles.show)
      }
    })

    const radioButtons = this.domElement.querySelectorAll(
      'input[name="searchOption"]'
    ) as NodeListOf<HTMLInputElement>

    radioButtons.forEach((radioButton) => {
      radioButton.addEventListener('change', () => {
        searchOptionsDropdown.classList.remove(styles.show)
      })
    })
  }
  private _setSearchEventListener(): void {
    const searchInput: HTMLInputElement = this.domElement.querySelector(
      '#searchInput'
    ) as HTMLInputElement

    searchInput.addEventListener('keyup', () => {
      const searchTerm: string = searchInput.value.toLowerCase()
      const selectedOption = this.domElement.querySelector(
        'input[name="searchOption"]:checked'
      ) as HTMLInputElement

      const searchField = selectedOption.value as keyof IEmployee

      const filteredEmployees = this.employees.filter((employee) =>
        employee[searchField].toLowerCase().includes(searchTerm)
      )
      this._renderEmployeeList(filteredEmployees)
    })
  }

  private _getEmployeeData(): Promise<IEmployee[]> {
    return sp.web.currentUser.groups.get().then((groups) => {
      const groupNames = groups.map((group) => group.Title)

      let listName = ''
      if (groupNames.includes('Group A')) {
        listName = 'employeeA'
      } else if (groupNames.includes('Group B')) {
        listName = 'employeeB'
      } else if (groupNames.includes('Group C')) {
        listName = 'employeeC'
      } else {
        console.error('User does not belong to any expected groups.')
        return Promise.resolve([])
      }
      const url = `https://socaraz.sharepoint.com/sites/intern/_api/web/lists/getbytitle('${listName}')/items`

      return this.context.spHttpClient
        .get(url, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => response.json())
        .then((data: any) => {
          console.log(data)
          return data.value as IEmployee[]
        })
    })
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0')
  }

  private _renderEmployeeList(employees: IEmployee[]): void {
    const employeeContainer: HTMLElement =
      this.domElement.querySelector('#employeeContainer')!
    employeeContainer.innerHTML = ''

    employees.forEach((employee) => {
      const employeeDiv = document.createElement('div')
      employeeDiv.className = styles.employeeCard
      const reactElement = React.createElement(EmployeePersona, {
        title: employee.Title,
        email: employee.KooperatifMail,
        serviceScope: this.context.serviceScope,
        teskilatvahidi: employee.TeskilatVahidi,
      })
      ReactDOM.render(reactElement, employeeDiv)
      employeeContainer.appendChild(employeeDiv)
    })
  }
}
