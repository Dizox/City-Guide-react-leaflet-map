import React, { useState } from 'react';
import Leaflet from 'leaflet';
import {
  Marker, Popup,
} from 'react-leaflet-universal';
import Route from '../../public/svg/route.svg';
import IconMore from '../../public/svg/iconMore.svg';
import ModalImageSlider from './ModalImageSlider';
import 'leaflet/dist/leaflet.css';
import { Point } from '../../api/interface';

import {
  POINTS,
} from './ArticleMap';

const pointsSettings = {
  red_point: {
    iconUrl: '../../img/articles/red_point.png',
    iconAnchor: [3.5, 7],
    popupAnchor: [-2, 0],
    iconSize: [7, 7],
  },
  red_marker: {
    iconUrl: '../../img/articles/red_marker.png',
    iconAnchor: [15.5, 41],
    popupAnchor: [0, -40],
    iconSize: [31, 41],
  },
  red_marker_mini: {
    iconUrl: '../../img/articles/red_marker_mini.png',
    iconAnchor: [12.5, 33],
    popupAnchor: [0, -40],
    iconSize: [25, 33],
  },
  purple_marker: {
    iconUrl: '../../img/articles/purple_marker.png',
    iconAnchor: [15.5, 41],
    popupAnchor: [0, -40],
    iconSize: [31, 41],
  },
  purple_point: {
    iconUrl: '../../img/articles/purple_point.png',
    iconAnchor: [5.5, 4.5],
    popupAnchor: [-2, 0],
    iconSize: [12, 12],
  },
};

const markType = {
  active: 'active',
  unactive: 'unactive',
};

const markPriorities = {
  points: 100,
  small_marker: 200,
  currentDay_marker: 300,
  active_marker: 400,
};

interface Props {
  point: Point;
}

export default function ArticlePoint({ point }: Props) {
  console.log('point', point);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  let markZIndexPriority = 0;

  const getMarkerTemplate = (selectedMark, day, typeOfMark) => {
    const iconTemplate = {
      html: `<img class="map-marker__img" src=${selectedMark.iconUrl} />
        ${day ? `<span class=${typeOfMark === markType.unactive ? 'map-marker__text-small' : 'map-marker__text'}>${day}</span>`
    : ''}`,
      className: 'map-marker',
    };

    return new Leaflet.DivIcon(Object.assign(iconTemplate, selectedMark));
  };

  const createMark = ({ type, inCurrentDay, selected }) => {
    let selectedMark = null;
    let typeOfMark = markType.unactive;

    if (type === POINTS.MAIN_POINT) {
      selectedMark = pointsSettings.red_marker_mini;
      markZIndexPriority = markPriorities.small_marker;
    }
    if (type === POINTS.MAIN_POINT && inCurrentDay) {
      selectedMark = pointsSettings.red_marker;
      typeOfMark = markType.active;
      markZIndexPriority = markPriorities.currentDay_marker;
    }
    if (type === POINTS.MAIN_POINT && (selected || isOpenPopup)) {
      selectedMark = pointsSettings.purple_marker;
      typeOfMark = markType.active;
      markZIndexPriority = markPriorities.active_marker;
    }
    if (type === POINTS.ADDITIONAL_POINT) {
      selectedMark = pointsSettings.red_point;
      markZIndexPriority = markPriorities.points;
    }
    if (type === POINTS.ADDITIONAL_POINT && (selected || isOpenPopup)) {
      selectedMark = pointsSettings.purple_point;
      markZIndexPriority = markPriorities.active_marker;
    }

    return getMarkerTemplate(selectedMark, point.day, typeOfMark);
  };

  return (
    <Marker
      key={point.uuid}
      position={[point.location.lat, point.location.lng]}
      icon={createMark(point)}
      zIndexOffset={markZIndexPriority}
    >
      <Popup
        onOpen={() => setIsOpenPopup(true)}
        onClose={() => setIsOpenPopup(false)}
      >
        <div>
          {(point.images && point.images.length) ? (
            <img
              className="hoverModalContainer__img"
              src={point.images[0].thumb}
              alt={point.images[0].alt}
            />
          ) : ''}
          <div className="modalContentContainer">
            <div className="modalTitleContainer">
              <div className="modalTitleContainer__img">
                <Route />
              </div>
              <div className="modalTitle">
                <p className="modalTitle__title">{point.name}</p>
                <p className="modalTitle__desc">{point.category_name}</p>
              </div>
            </div>
            <button
              type="button"
              className="modalMoreContainer"
              onClick={() => {
                setIsOpenModal(true);
              }}
            >
              <div className="modalMoreContainer__img">
                <IconMore />
              </div>
              <p className="modalMoreContainer__title">Подробнее о точке</p>
            </button>
          </div>
        </div>
        <ModalImageSlider
          setIsOpenModal={setIsOpenModal}
          isOpenModal={isOpenModal}
          images={point.images}
          pointTitle={point.name}
          pointDescription={point.category_name}
          isPoint
        />
      </Popup>
    </Marker>
  );
}
