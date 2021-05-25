import React from 'react';
import { Link } from 'react-router-dom'

class BrokerURL extends React.Component {
     /* Affichage de la boîte permettant à l'utilisateur d'insérer un URL */
    render() {
        return (
            <div>
                <h3>Brocker URL :</h3>
                <p className="Exemple">Example : ws://random.pigne.org:1883/</p>
                <div>
                    <input className="InputYourUrl" type='search' placeholder="Input your url"/>
                    <Link to="/"><button className="ButtonValidInput" onClick={this.props.onClick} type="button">OK</button></Link>
                </div>
            </div>)
    };
}

export default BrokerURL;
