
import { LitElement, html } from 'lit-element';
import style from './style';


class WazeCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    };
  }

  constructor() {
    super();
    this.wazeBaseUrl = 'https://www.waze.com/ul?navigate=yes&ll=';
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('Entities list required.');
    }

    if (config.columns && !Array.isArray(config.columns)) {
      throw new Error('columns config needs to be a list');
    }

    this.config = {
      title: 'Waze Routes',
      header: true,
      columns: ['name', 'distance', 'duration', 'route'],
      ...config,
    };
  }

  /**
   * get the current size of the card
   * @return {Number}
   */
  getCardSize() {
    return this.config && this.config.header ? 4 : 3;
  }

  static get styles() {
    return style;
  }

  /**
   * generates the card HTML
   * @return {TemplateResult}
   */
  render() {
    const wazeStates = this.getAllStates(this.config.entities);
    return this.createCard(wazeStates);
  }

  /**
   * @param {Array<Object>} wazeStates
   * @return {TemplateResult}
   */
  createCard(wazeStates) {
    const header = this.config.header ? html`<div class='header'>${this.config.title}</div>` : html``;

    return html`
      <ha-card>
        ${header}
        <div class='waze-card-wrapper'>
          <table>
            <thead>
              ${this.config.columns.map(column => html`<th align="left">${column}</th>`)}
            </thead>
            <tbody>
              ${this.createCardBody(wazeStates)}
            </tbody>
          </table>
        </div>
      </ha-card>
    `;
  }

  /**
   *
   * @param {Array<Object>} wazeStates
   * @return {Array<TemplateResult>}
   */
  createCardBody(wazeStates) {
    return wazeStates.map((state) => {
      // create the routes columns based on config array
      const routeColumns = this.config.columns.map(column => html`
          <td @click=${() => state.location && window.open(`${this.wazeBaseUrl}${state.location.lat}%2C${state.location.long}`)}>
            ${(state[column] || '')}
          </td>
        `);

      return html`
        <tr class='${state.location ? 'waze-card-pointer' : ''}'>
          ${routeColumns}
        </tr>
      `;
    });
  }


  /**
   * formats all states for this card to use for the HTML
   * @param {Array<Object>} entities
   * @return {Array<Object>}
   */
  getAllStates(entities) {
    return entities
      .map((entity) => {
        const state = this.hass.states[entity.entity || ''];
        if (!state) return;

        state.name = entity.name || state.attributes.friendly_name;

        // if given a zone then att lat/long  for clicking to open waze
        if (entity.zone) {
          const zone = this.hass.states[entity.zone || ''];
          if (!zone) throw new Error(`Could not find config for zone entity ${entity.zone}`);

          state.location = { lat: zone.attributes.latitude, long: zone.attributes.longitude };
          state.name = state.name ? state.name : zone.attributes.friendly_name;
        }

        return state;
      })
      .filter(Boolean)
      .map(state => ({
        location: state.location || '',
        name: state.name || state.entity || '',
        distance: this.computeDistance(state),
        duration: this.computeDuration(state),
        route: state.attributes && state.attributes.route || '',
      }));
  }

  /**
   * generates the duration for a route
   * @param  {Object} state the card state
   * @return {string} the formatted duration for a ruote
   */
  computeDuration(state) {
    const duration = state.attributes && state.attributes.duration || 0;
    const unit_of_measurement = state.attributes && state.attributes.unit_of_measurement || '';
    return `${parseInt(duration, 0)} ${unit_of_measurement}`;
  }

  /**
   * computes the distance for a route for metric/imperial system
   * @param  {Object} state the card state
   * @return {string} the formatted distance
   */
  computeDistance(state) {
    let distance = state.attributes && state.attributes.distance || 0;
    distance = parseInt(Math.round(distance), 0);
    distance = `${distance}${this.hass.config.unit_system.length}`;
    return distance;
  }
}

customElements.define('waze-card', WazeCard);
