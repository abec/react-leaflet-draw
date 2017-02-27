import { PropTypes } from 'react';
import Draw from 'leaflet-draw'; // eslint-disable-line
import isEqual from 'lodash.isequal';

import { LayersControl } from 'react-leaflet';

const eventHandlers = {
  onEdited: 'draw:edited',
  onEditStart: 'draw:editstart',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop',
};

export default class EditControl extends LayersControl {
  static propTypes = {
    ...Object.keys(eventHandlers).reduce((acc, val) => {
      acc[val] = PropTypes.func;
      return acc;
    }, {}),
    onCreated: PropTypes.func,
    onMounted: PropTypes.func,
    draw: PropTypes.object,
    edit: PropTypes.object,
    position: PropTypes.oneOf([
      'topright',
      'topleft',
      'bottomright',
      'bottomleft'
    ])
  };

  onDrawCreate = (e) => {
    const { onCreated } = this.props;
    const { layerContainer } = this.context;

    layerContainer.addLayer(e.layer);
    onCreated && onCreated(e);
  };

  componentWillMount() {
    const { map } = this.context;
    const { onMounted } = this.props;

    this.updateDrawControls();

    onMounted && onMounted(this.leafletElement);

    map.on('draw:created', this.onDrawCreate);

    for (const key in eventHandlers) {
      if (this.props[key]) {
        map.on(eventHandlers[key], this.props[key]);
      }
    }
  }

  componentWillUnmount() {
    const { map } = this.context;
    this.leafletElement.remove(map);

    map.off('draw:created', this.onDrawCreate);

    for (const key in eventHandlers) {
      if (this.props[key]) {
        map.off(eventHandlers[key], this.props[key]);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // super updates positions if thats all that changed so call this first
    super.componentDidUpdate(prevProps);

    if (isEqual(this.props.draw, prevProps.draw) || this.props.position !== prevProps.position) {
      return false;
    }

    const { map } = this.context;

    this.leafletElement.remove(map);
    this.updateDrawControls();
    this.leafletElement.addTo(map);

    return null;
  }

  updateDrawControls = () => {
    const { layerContainer } = this.context;
    const { draw, edit, position } = this.props;
    const options = {}

    if (draw) {
      options.draw = draw;
    }

    if (edit) {
      options.edit = edit;
    } else {
      options.edit = {}
    }

    options.edit.featureGroup = layerContainer

    if (position) {
      options.position = position;
    }
    console.log(options)

    this.leafletElement = new L.Control.Draw(options); // eslint-disable-line
  };
}
