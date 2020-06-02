import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import {
  Map, TileLayer, FeatureGroup, ZoomControl,
} from 'react-leaflet-universal';
import 'leaflet/dist/leaflet.css';
import ArticlePoint from './ArticlePoint';
import { Points, Days, SelectedPoint } from '../../api/interface';

export const POINTS = {
  MAIN_POINT: 'main',
  ADDITIONAL_POINT: 'additional',
};

const UPDATE_POINTS = {
  SHOW: 'show',
  HIDE: 'hide',
};

interface Props {
  points: Points,
  days: Days,
  selectedPoint: SelectedPoint,
}

export default function ArticleMap({
  points, days, selectedPoint,
}: Props) {
  const mapRef = useRef<Map>();
  const groupRef = useRef();

  const mainPoints = days.reduce((daysCoords, day, dayNumber) => {
    const daysData = day.points.reduce((mainPointsData, point) => [...mainPointsData, {
      uuid: point.uuid,
      day: dayNumber + 1,
      category_name: point.category_name,
      location: point.location,
      name: point.name,
      name_location: point.name_location,
      images: point.images,
      type: POINTS.MAIN_POINT,
      inCurrentDay: false,
      selected: false,
    }],
    []);
    return [...daysCoords, ...daysData];
  }, []);

  const additionalPoints = points.reduce((additionalPointsData, additionalPoint) =>
    // filter additional points by uuid
    // eslint-disable-next-line implicit-arrow-linebreak
    (mainPoints.some((mainPoint) => mainPoint.uuid === additionalPoint.uuid)
      ? additionalPointsData : [...additionalPointsData, {
        uuid: additionalPoint.uuid,
        day: null,
        category_name: additionalPoint.category_name,
        location: additionalPoint.location,
        name: additionalPoint.name,
        name_location: additionalPoint.name_location,
        images: additionalPoint.images,
        type: POINTS.ADDITIONAL_POINT,
        inCurrentDay: false,
        selected: false,
      }]),
  []);

  const [allPoints, setAllPoints] = useState([...mainPoints, ...additionalPoints]);

  const findDayScreenPosition = () => {
    const findedPos = [];

    for (let i = 1; i < days.length + 1; i += 1) {
      const dayElem = document.getElementById(`day_${i}`);
      const positionStart = dayElem.offsetTop;
      const positionEnd = dayElem.offsetTop + dayElem.offsetHeight;
      findedPos.push({
        dayNumber: i,
        positionStart,
        positionEnd,
      });
    }

    return findedPos;
  };


  const findCurrentDay = (currentPosition) => {
    const positionsDays = findDayScreenPosition();
    const findedCurrentDay = positionsDays.find(
      (day) => day.positionStart < currentPosition && currentPosition < day.positionEnd,
    );

    if (findedCurrentDay) {
      const changedPoints = allPoints.map((point) => (
        point.day === findedCurrentDay.dayNumber && point.type !== POINTS.ADDITIONAL_POINT
          ? { ...point, inCurrentDay: true }
          : { ...point, inCurrentDay: false }
      ));
      setAllPoints(changedPoints);
    }
  };

  const handleScroll = () => {
    findCurrentDay(window.pageYOffset + (window.innerHeight / 2));
  };

  const mapAutoCenter = () => {
    const currentMapRef = mapRef.current;
    const currentGroupRef = groupRef.current;
    if (currentMapRef && currentGroupRef) {
      const map = currentMapRef.leafletElement;
      if (allPoints.length) {
        map.fitBounds(allPoints.map((point) => {
          const { lat, lng } = point.location;
          return [lat, lng];
        }));
      }
    }
  };

  useEffect(() => {
    const trottedHandleScroll = _.throttle(handleScroll, 200);
    window.addEventListener('scroll', trottedHandleScroll);
    handleScroll();
    return function removeListener() {
      window.removeEventListener('scroll', trottedHandleScroll);
    };
  }, []);

  useEffect(() => {
    let updatedPoints = [];

    if (selectedPoint.type === UPDATE_POINTS.SHOW) {
      updatedPoints = allPoints.map((point) => (point.uuid === selectedPoint.uuid
        ? Object.assign(point, { selected: true })
        : point));
    }

    if (selectedPoint.type === UPDATE_POINTS.HIDE) {
      updatedPoints = allPoints.map((point) => (point.uuid === selectedPoint.uuid
        ? Object.assign(point, { selected: false })
        : point));
    }

    if (updatedPoints.length) {
      setAllPoints(updatedPoints);
    }
  }, [selectedPoint]);

  return (
    <Map
      center={[0, 0]}
      zoom={1}
      attribution="123"
      ref={mapRef}
      whenReady={mapAutoCenter}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <FeatureGroup ref={groupRef}>
        {_.uniqBy(allPoints, 'uuid').map((point) => (
          <ArticlePoint
            key={point.uuid}
            point={point}
          />
        ))}
      </FeatureGroup>
    </Map>
  );
}
