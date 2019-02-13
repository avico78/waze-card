/**
 * creates a lovelace card to show waze routes details
 */
class WazeCard extends HTMLElement {

  /**
   * called by hass - creates card, sets up any conmfig settings, and generates card
   * @param {Object} hass
   */
  set hass(hass) {
    this._hass = hass;

    const wazeStates = this.getAllStates(this.config.entities);
    this.updateHtmlIfNecessary(wazeStates);
  }

  /**
   * formats all states for this card to use for the HTML
   * @param {Array<Object>} entities  
   */
  getAllStates(entities) {
    return entities
      .map(entity => {
        const state = this._hass.states[entity.entity || ''];
        if (!state) return;

        state.name = entity.name || state.attributes.friendly_name;

        // if given a zone then att lat/long  for clicking to open waze
        if (entity.zone) {
          const zone = this._hass.states[entity.zone || ''];
          state.location = { lat: zone.attributes.latitude, long: zone.attributes.longitude };
          state.name = state.name ? state.name : zone.attributes.friendly_name
        }

        return state;
      })
      .filter(Boolean)
      .map(state => {
        return {
          location: state.location || '',
          name: state.name || state.entity || '',
          distance: this.computeDistance(state),
          duration: this.computeDuration(state),
          route: state.attributes && state.attributes.route || ''
        };
      });
  }

  /**
   * Updates the HTML if anything has changed
   * @param {Array<Object>} wazeStates
   */
  updateHtmlIfNecessary(wazeStates) {
    if (JSON.stringify(wazeStates) === JSON.stringify(this.currentStates || [])) return;

    this.currentStates = wazeStates;
    this.createCard();
  }

  /**
   * generates the duration for a route
   * @param  {Object} state the card state
   * @return {string} the formatted duration for a ruote
   */
  computeDuration(state) {
    let duration = state.attributes && state.attributes.duration || 0;
    let unit_of_measurement = state.attributes && state.attributes.unit_of_measurement || '';
    return `${parseInt(duration)} ${unit_of_measurement}`;
  }

  /**
   * computes the distance for a route for metric/imperial system
   * @param  {Object} state the card state
   * @return {string} the formatted distance 
   */
  computeDistance(state) {
    let distance = state.attributes && state.attributes.distance || 0;
    if (this._hass.config.unit_system.length === 'mi') distance = distance * 0.62137;

    distance = parseInt(Math.round(distance));
    distance = `${distance}${this._hass.config.unit_system.length}`;
    return distance;
  }

  /**
   * generates the entire card and adds it to the dom
   */
  createCard() {
    this.content.innerHTML = this.cssRules;
    const stateTable = document.createElement('table');
    stateTable.classList.add('waze-card-route-table');

    const cardHeader = this.createCardHeader();
    if (cardHeader) stateTable.append(cardHeader);

    const cardBody = this.createCardBody();
    if (cardBody) stateTable.append(cardBody);

    this.content.append(stateTable);
  }

  /**
   * creates the table header
   * @return {HTMLElement} the table header element
   */
  createCardHeader() {
    if (!this.config.header) return;

    const stateHeader = document.createElement('thead');
    stateHeader.classList.add('waze-card-route-head');

    this.config.columns.forEach(column => {
      const stateRouteHeaderItem = document.createElement('th');
      stateRouteHeaderItem.classList.add('waze-card-route-head-item');
      stateRouteHeaderItem.setAttribute("align", "left");
      stateRouteHeaderItem.innerHTML = (column || '').toLowerCase();
      stateHeader.append(stateRouteHeaderItem);
    });

    return stateHeader;
  }

  /**
   * creates the table body and a row for each route
   * @return {HTMLElement} the table body element
   */
  createCardBody() {
    const stateBody = document.createElement('tbody');
    stateBody.classList.add('waze-card-route-body');



    this.currentStates.map(state => {
      const location = state.location && JSON.stringify(state.location);

      const stateRouteRow = document.createElement('tr');
      stateRouteRow.classList.add('waze-card-route-row');

      // if we have a location then add pointer and location data
      if (location) {
        stateBody.classList.add('waze-card-pointer');
        stateRouteRow.dataset.location = location;
      }

      // for each value create a HTML column
      this.config.columns.forEach(column => {
        const stateRouteItem = document.createElement('td');
        stateRouteItem.classList.add('waze-card-route-item');

        stateRouteItem.innerHTML = (state[column] || '').toLowerCase();
        stateRouteItem.dataset.location = location;
        stateRouteRow.append(stateRouteItem);
      });

      stateBody.append(stateRouteRow);
    });

    return stateBody;
  }

  /**
   * merge the user configuration with default configuration and initialize card
   * @param {[type]} config [description]
   */
  setConfig(config) {

    if (!config.entities) {
      throw new Error('Entities list required.');
    }

    if (config.columns && !Array.isArray(config.columns)) {
      throw new Error('columns config needs to be a list');
    }

    // setup conig
    this.config = {
      title: 'Waze Routes',
      group: false,
      header: true,
      columns: ['name', 'distance', 'duration', 'route'],
      ...config
    };

    // create card
    const card = document.createElement('ha-card');
    if (this.config.title) card.header = `${this.config.title}`;
    this.content = document.createElement('div');

    // if not a part of a card group then add card padding
    if (!this.config.group) {
      this.content.classList.add('waze-card-wrapper');
    }

    // add click event to open waze routes
    this.content.addEventListener('click', event => {
      const source = event.target || event.srcElement;
      if (!source || !source.dataset || !source.dataset.location) return;

      const location = JSON.parse(source.dataset.location);
      window.open(`https://www.waze.com/ul?navigate=yes&ll=${location.lat}%2C${location.long}`);
    });

    card.appendChild(this.content);
    this.appendChild(card);

    // save css rules
    this.cssRules = `
        <style>
          .waze-card-wrapper {
          }

          .waze-card-route-table {
            padding: 0 16px 10px;
                font-size: 1.1em;
          }

          .waze-card-route-head {
            padding: 0 16px 10px;
          }

          .waze-card-route-head-item {
            padding: 0 15px 0 0;
            text-transform: capitalize;
          }   

          .waze-card-pointer {
            cursor: pointer;
          }

          .waze-card-route-row {
          }

          .waze-card-route-item {
            text-transform: capitalize;
            padding-top: 10px;
            padding-bottom: 10px;
          }
        </style>
      `;
  }

  /**
   * get the size of the card
   * @return 1
   */
  getCardSize() {
    return 1;
  }
}


/**
 * add card definition to hass
 */
customElements.define('waze-card', WazeCard);