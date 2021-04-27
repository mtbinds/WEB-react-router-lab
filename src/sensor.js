
export const version = () => "1.0.0";

export const Enumeration = function (keys) {
  const enumeration = Object.create(null);
  for (const key of keys) {
    enumeration[key] = key;
  }
  enumeration[Symbol.iterator] = function* () {
    for (let key of keys) {
      yield enumeration[key];
    }
  };
  Object.freeze(enumeration);
  return enumeration;
};

export const SensorType = new Enumeration(['TEMPERATURE', 'DOOR', 'FAN_SPEED','POSITIVE_NUMBER','PERCENT','ON_OFF','OPEN_CLOSE']);

export class Sensor {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data;
  }
  set id(id) {
    if(!(typeof id === 'number' && Number.isInteger(id))){ id = NaN;}
    this._id = id;
  }
  get id() {
    return this._id;
  }
  set name(name) {
    if(!(typeof name === 'string')){ name = "";}
    this._name = name;
  }
  get name() {
    return this._name;
  }
  set data(data) {
    if(!(data instanceof Data)){ data = new Data();}
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class Temperature extends Sensor{
  set data(data) {
    if(!(data instanceof TimeSeries)){ data = new TimeSeries();}
    /* limite minimale de température au zéro absolu */
    for(let i=0;i<data.values.length;i++){ if(!isNaN(data.values[i]) && data.values[i] < -273.15){data.values[i]=-273.15;} }
    this._data = data;
  }
  get data() {
    return this._data;
  }
  fahrenheit(){
    let tab = [];
    for(let i=0;i<this.data.values.length;i++){
      if(isNaN(this.data.values[i])){
        tab.push(NaN);
      }
      else{
        tab.push((this.data.values[i]*(9/5) + 32));
      }
    }
    return tab;
  }
}

export class Positive_Number extends Sensor{
  set data(data) {
    if(!(data instanceof TimeSeries)){ data = new TimeSeries();}
    /* limite minimale de vitesse à 0 */
    for(let i=0;i<data.values.length;i++){ if(!isNaN(data.values[i]) && data.values[i]<0){data.values[i]=0;} }
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class Percent extends Sensor{
  set data(data) {
    if(!(data instanceof TimeSeries)){ data = new TimeSeries();}
    for(let i=0;i<data.values.length;i++){
      if(!isNaN(data.values[i]) && data.values[i]<0){data.values[i]=0;}
      if(!isNaN(data.values[i]) && data.values[i]>0){data.values[i]=100;}
    }
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class Door extends Sensor{
  set data(data) {
    if(!(data instanceof Datum)){ data = new Datum();}
    /* value est 0, 1 ou NaN */
    if(!isNaN(data.value) && data.value!==1 && data.value!==0){data.value=NaN;}
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class On_Off extends Sensor{
  set data(data) {
    if(!(data instanceof Datum)){ data = new Datum();}
    if(!isNaN(data.value) && data.value!=='ON' && data.value!=='OFF'){data.value=NaN;}
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class Open_Close extends Sensor{
  set data(data) {
    if(!(data instanceof Datum)){ data = new Datum();}
    /* value est 0, 1 ou NaN */
    if(!isNaN(data.value) && data.value!=='OPEN' && data.value!=='CLOSE'){data.value=NaN;}
    this._data = data;
  }
  get data() {
    return this._data;
  }
}


export class Fan_Speed extends Sensor{
  set data(data) {
    if(!(data instanceof TimeSeries)){ data = new TimeSeries();}
    /* limite minimale de vitesse à 0 */
    for(let i=0;i<data.values.length;i++){ if(!isNaN(data.values[i]) && data.values[i]<0){data.values[i]=0;} }
    this._data = data;
  }
  get data() {
    return this._data;
  }
}

export class Data { }

export class Datum extends Data{
  constructor(value) {
    super();
    this.value = value;
  }
  set value(value) {
    if(!(typeof value === 'number')){ value = NaN;}
    this._value = value;
  }
  get value() {
    return this._value;
  }
}

export class TimeSeries extends Data{
  constructor(values,labels) {
    super();
    this.values = values;
    this.labels = labels;
  }
  set values(values) {
    if(!(values instanceof Array)){ values = [];}
    for(let i=0;i<values.length;i++){ if(!(typeof values[i] === 'number')){ values[i] = NaN;} }
    this._values = values;
  }
  get values() {
    return this._values;
  }
  set labels(labels) {
    if(!(labels instanceof Array)){ labels = [];}
    for(let i=0;i<labels.length;i++){ if(!(typeof labels[i] === 'string')){ labels[i] = "";} }
    this._labels = labels;
  }
  get labels() {
    return this._labels;
  }
  Sum() {
    let sum = 0;
    for(let i=0;i<this.values.length;i++){
      if(!isNaN(this.values[i])){ sum += this.values[i];}
    }
    return sum;
  }
  Average() {
    let i=0;
    let nanNb=0;
    let sum = 0;
    for(i;i<this.values.length;i++){
      if(!isNaN(this.values[i])){ sum += this.values[i];}
      else {nanNb++;}
    }
    return sum/(i-nanNb);
  }
}

export function readData(data){
  for(let elem in data){
    switch(elem.type){
      case(SensorType['TEMPERATURE']):
        return new Temperature(elem.id,elem.name, new TimeSeries(elem.data.values,elem.data.labels));
      case(SensorType['DOOR']):  return new Door(elem.id,elem.name, new Datum(elem.data.value));
      case(SensorType['FAN_SPEED']): return new Fan_Speed(elem.id,elem.name, new TimeSeries(elem.data.values,elem.data.labels));
      case(SensorType['POSITIVE_NUMBER']):return new Positive_Number(elem.id,elem.name, new TimeSeries(elem.data.values,elem.data.labels));
      case(SensorType['PERCENT']):return new Percent(elem.id,elem.name, new TimeSeries(elem.data.values,elem.data.labels));
      case(SensorType['ON_OFF']):return new On_Off(elem.id,elem.name, new Datum(elem.data.value));
      case(SensorType['OPEN_CLOSE']):return new Open_Close(elem.id,elem.name, new Datum(elem.data.value));
      default: return new Sensor(0,'undefined',new Datum(NaN));
    }
  }
}
