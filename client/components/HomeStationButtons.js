import React from 'react';
import { useDispatch } from 'react-redux';
import { postStation, deleteStation } from '../store/stations';

function HomeStationButtons({ selectedStation, homeStations }) {
  const dispatch = useDispatch();

  const homeStationsCheck = (homeStations, selectedStation) => {
    for (let i = 0; i < homeStations.length; i++) {
      let currentStation = homeStations[i];

      if (currentStation.code === selectedStation.properties['stop_id']) {
        return true;
      }
    }
    return false;
  };

  return (
    <React.Fragment>
      {homeStationsCheck(homeStations, selectedStation) ? (
        <button
          type='button'
          onClick={() => {
            dispatch(deleteStation(selectedStation.properties['stop_id']));
          }}
        >
          Remove Station
        </button>
      ) : (
        <button
          type='button'
          onClick={() => {
            dispatch(postStation(selectedStation.properties['stop_id']));
          }}
        >
          Add Station
        </button>
      )}
    </React.Fragment>
  );
}

export default HomeStationButtons;