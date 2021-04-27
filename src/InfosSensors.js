import React from 'react';

class InfosSensors extends React.Component {
     render() {
        /*  Si l'utilisateur n'a pas encore cliqué sur un sensor, on affiche rien */
        if (this.props.tabAffichee.length === 0) {
            return <div></div>
        } else {
            /* On crée un tableau de span contenant les dernières valeurs pour les afficher en react */
            let elem = [];
            for(let i=0; i < this.props.tabAffichee[3].length; i++) {
                elem[i] = <span className="ToBeSmaller"><p>{this.props.tabAffichee[3][i]}</p></span>
            }

            /* On affiche les données du sensor */
            return (
                <div className="Card2">
                    <br/>
                    <button className="Box">
                        <h3>{this.props.tabAffichee[1]}</h3><br/>
                        <p className="Left"><b>Identifier : </b><span className="ToBeSmaller">{this.props.tabAffichee[0]}</span></p>
                        <p className="Left"><b>Type : </b><span className="ToBeSmaller">{this.props.tabAffichee[2]}</span></p>
                        <p className="Left"><b>Current value : </b><span className="ToBeSmaller">{this.props.tabAffichee[3][0]}</span></p><br/>
                        <p><b>Last Values : </b></p>{elem}
                    </button>
                </div>);
        }
    }
}

export default InfosSensors;
