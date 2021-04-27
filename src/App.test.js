import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import InfosSensors from "./InfosSensors";

describe('tests', () => {

  test('test App render', () => {
    const {getByText} = render(
        <BrowserRouter>
          <App/>
        </BrowserRouter>);

    expect(getByText).toEqual(getByText);
  });

  test('test InfosSensors render', () => {
    let tabDonnees = [];
    tabDonnees.push(898);
    tabDonnees.push("name");
    tabDonnees.push("TEMPERATURE");
    tabDonnees.push([8,5,3]);
    const {getByText} = render(<InfosSensors tabAffichee={tabDonnees}/>);
    expect(getByText).toEqual(getByText);
  });

});
