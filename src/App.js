import React from 'react';
import './App.css';
import * as Sensor from "./sensor";
import BrockerURL from './BrockerURL';
import InfosSensors from "./InfosSensors";
import {Link, Route} from "react-router-dom";

var mqtt = require('mqtt');
var infosRecuperees = false;

// On affichera les (tailleHistorique) dernières valeurs
const tailleHistorique = 10;


class App extends React.Component {
    /* Constructeur de notre application React */
    constructor(props) {
        super(props);
        this.state = {
            /* tabSensors = Tableau contenant l'id et le nom des sensors à afficher (Récupère une seule fois) */
            tabSensors: [],
            /* tabDonnees = Tableau contenant toutes les données récupérées des sensors */
            tabDonnees: [],
            /* tabAffichee = Tableau contenant les informations à afficher au clic sur le sensor "idSensor" */
            tabAffichee: [],
            idSensor: -1
        };

        this.eventClient = this.eventClient.bind(this);
        this.receptionDonnees = this.receptionDonnees.bind(this);
    }


    /* Vérifie l'URL du Brocker et reçois toutes les données de celui-ci */
    eventClient(event) {
        /* Si on met une URL en MQTT ou en WS, on considère qu'elle est bonne. */
        if (goodSyntax(document.getElementsByClassName("InputYourUrl")[0].value)) {
            var client = mqtt.connect(document.getElementsByClassName("InputYourUrl")[0].value);
            client.on("connect", () => {
                client.subscribe('value/#', (err) => {
                    if (err) console.error(err);
                });
            });
            client.on("message", this.receptionDonnees.bind(this));
        } else {
            alert("L'URL que vous avez écrit n'est pas au bon format. Réessayez.");
        }
    }


    /* On récupère les données que nous envoie le Brocker */
    receptionDonnees(topic, message) {
        let sensor = Sensor.readData(JSON.parse(message));
        sensor.id = Number(topic.split("/")[1]);
        sensor.type = JSON.parse(message).type;
        sensor.data.values = [JSON.parse(message).value];
        sensor.name = JSON.parse(message).name;

        /* On stocke le nom du sensor si celui-ci est rencontré pour la 1ere fois */
        let sensorDejaVu = false;
        for (const val in this.state.tabSensors) {
            if (this.state.tabSensors[val][0] === sensor.id) {
                sensorDejaVu = true;
            }
        }
        if (!sensorDejaVu) this.state.tabSensors.push([sensor.id, sensor.name]);
        /* REMARQUE: les setState de ce programme permet de mettre à jour notre affichage lorsque c'est nécessaire */
        this.setState({tabSensors: this.state.tabSensors});

        /* On stocke les informations du sensor */
        this.state.tabDonnees.push([sensor.id, sensor.name, sensor.type, sensor.data.values]);
        this.setState({tabDonnees: this.state.tabDonnees});

        /* On met à jour les informations affichées sur le sensor */
        if (this.state.idSensor !== -1) { /* Vrai si l'utilisateur a sélectionné un sensor */
            let nombreDeValeurs = tailleHistorique;
            let taille = this.state.tabDonnees.length - 1;
            let tableauValeurs = [];
            this.state.tabAffichee.pop();
            /* Tant qu'on a pas récupéré les (tailleHistorique) dernières valeurs dans notre tableau de données */
            while ((nombreDeValeurs !== 0) && (taille > 0)) {
                if (this.state.tabDonnees[taille][0] === this.state.idSensor) {
                    if (!infosRecuperees) {
                        this.state.tabAffichee.push(this.state.tabDonnees[taille][0]);
                        this.state.tabAffichee.push(this.state.tabDonnees[taille][1]);
                        this.state.tabAffichee.push(this.state.tabDonnees[taille][2]);
                        infosRecuperees = true;
                    }
                    for (let i = 0; i < this.state.tabDonnees[taille][3].length; i++) {
                        if (nombreDeValeurs > 0) {
                            tableauValeurs.push(this.state.tabDonnees[taille][3][i]);
                            nombreDeValeurs--;
                        }
                    }
                }
                taille--;
            }
            this.state.tabAffichee.push(tableauValeurs);
            this.setState({tabAffichee: this.state.tabAffichee});
        }
    }


    /* Lorsque l'utilisateur sélectionne un sensor, on met à jour l'affichage et on récupère l'id du sensor sélectionné */
    buttonClicked = idSensor => {
       this.setState({ idSensor: idSensor });
       this.setState({ tabAffichee: [] });
       infosRecuperees = false;
    };


    /* Affichage des données en React */
    render() {
        /*
         * Permet l'affichage des noms des sensors et le clic des boutons.
         * Pour cela on a besoin de l'id du sensor ET de nos states
         * En effet, il faut écrire onClick={() => this.buttonClicked(this.state.tabSensors[i][0])}
         * Par conséquent l'instruction ne peut pas être écrite sur un fichier distinct
         * Prend en charge les routes de chaque bouton qui affiche les différent senseurs
         */
        const title = (this.state.tabSensors !== undefined || this.state.tabSensors.length > 0) ? <h3 className="TitleToBeCenter">Sensors list :</h3> : <h3> </h3>;

        const elem = [];
        for(let i=0; i < this.state.tabSensors.length; i++) {
            let path = this.state.tabSensors[i][1].replace(/ /g,'_');
            elem[i] = <span><Link to={`/${path}`} activeClassName="active"><button className="ButtonNameSensors" onClick={() =>
                this.buttonClicked(this.state.tabSensors[i][0])} type="button">{this.state.tabSensors[i][1]}</button>
                <Route  path={`/${path}`}  render={(props) => (
                    <InfosSensors {...props} tabAffichee={this.state.tabAffichee}/>
                )}/>
                </Link><br/></span>;
        }

        /*
         * La balise <BrockerURL> renvoie le contenu react de BrockerURL.js
         */
        return (
            <div className="App">
                <header className="App-header">
                    <BrockerURL onClick={this.eventClient.bind(this)} />
                    <div className="Card1">
                        {title}
                        {elem}
                    </div>
                </header>
            </div>
        );
    }

}


/* Vérification de l'URL du Brocker */
export function goodSyntax(url){
    return url.includes('mqtt://') || url.includes('ws://') || url.includes('wss://');
}

export default App;
