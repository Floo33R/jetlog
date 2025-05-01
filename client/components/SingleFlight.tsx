import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import { Button, Heading, Input, Select, Subheading, TextArea } from '../components/Elements'
import { Flight, User } from '../models';
import SearchInput from './SearchInput';
import API from '../api';
import ConfigStorage from '../storage/configStorage';
import { objectFromForm } from '../utils';

export default function SingleFlight({ flightID }) {
    const [flight, setFlight] = useState<Flight>();
    const [selfUsername, setSelfUsername] = useState<string>();
    const [editMode, setEditMode] = useState<Boolean>(false);

    const navigate = useNavigate();
    const metricUnits = ConfigStorage.getSetting("metricUnits");
    const localAirportTime = ConfigStorage.getSetting("localAirportTime");

    useEffect(() => {
        API.get(`/flights?id=${flightID}&metric=${metricUnits}`)
        .then((data: Flight) => {
            setFlight(data);
        });

        API.get("/users/me")
        .then((data: User) => {
            setSelfUsername(data.username);
        });
    }, []);

    if(flight === undefined) {
        return (
            <p className="m-4">Loading...</p>
        );
    }

    const toggleEditMode = (event) => {
        event.preventDefault();
        setEditMode(!editMode);
    }

    const deleteFlight = (event) => {
        event.preventDefault();
        if(confirm("Are you sure?")) {
            API.delete(`/flights?id=${flight.id}`)
            .then(() => navigate("/"));
        }
    }

    const updateFlight = (event) => {
        event.preventDefault();

        const flightPatchData = objectFromForm(event);

        if (flightPatchData === null) {
            this.toggleEditMode();
            return;
        }

        API.patch(`flights?id=${flight.id}&timezones=${localAirportTime}`, flightPatchData)
        .then(() => window.location.reload());
    }

    return (
        <>
            <Heading text={`${flight.origin.iata || flight.origin.icao } to ${flight.destination.iata || flight.destination.icao}`} />
            <h2 className="-mt-4 mb-4 text-xl">{flight.username} on {flight.date}</h2>
           
            <form onSubmit={updateFlight}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <div className="container">
                    <Subheading text="Timings" />
                    { editMode ? 
                    <>
                        <p>Date: <Input type="date" name="date" defaultValue={flight.date} /></p>
                        <p>Departure Time: <Input type="time" name="departureTime" defaultValue={flight.departureTime} /></p>
                        <p>Arrival Time: <Input type="time" name="arrivalTime" defaultValue={flight.arrivalTime} /></p>
                        <p>Arrival Date: <Input type="date" name="arrivalDate" defaultValue={flight.arrivalDate}/></p>
                        <p>Duration: <Input type="number" name="duration" placeholder={flight.duration?.toString()}/></p>
                    </>
                    :
                    <>
                        <p>Date: <span>{flight.date}</span></p>
                        <p>Departure Time: <span>{flight.departureTime || "N/A"}</span></p>
                        <p>Arrival Time: <span>{flight.arrivalTime || "N/A"}</span></p>
                        <p>Arrival Date: <span>{flight.arrivalDate || "N/A"}</span></p>
                        <p>Duration: <span>{flight.duration ? flight.duration + " min" : "N/A"}</span></p>
                    </>
                    }
                </div>

                <div className="container">
                    <Subheading text="Airports" />
                    { editMode ?
                    <>
                        <p>Origin: <SearchInput name="origin" type="airports" placeholder={flight.origin}/></p>
                        <p>Destination: <SearchInput name="destination" type="airports" placeholder={flight.destination} /></p>
                        <p>Distance (km): <Input type="number" name="distance" placeholder={flight.distance?.toString()}/></p>
                    </>
                    :
                    <>
                        <p className="mb-2">Distance: <span>{flight.distance ? flight.distance + (metricUnits === "false" ? " mi" : " km") : "N/A"}</span></p>
                        <p className="font-bold">Origin</p> 
                        <ul className="mb-2">
                            <li>ICAO/IATA: <span>{flight.origin.icao}/{flight.origin.iata}</span></li>
                            <li>Type: <span>{flight.origin.type}</span></li>
                            <li>Name: <span>{flight.origin.name}</span></li>
                            <li>Location: <span>{flight.origin.continent}, {flight.origin.country}, {flight.origin.region}, {flight.origin.municipality}</span></li>
                            <li>Timezone: <span>{flight.origin.timezone}</span></li>
                        </ul>

                        <p className="font-bold">Destination</p> 
                        <ul>
                            <li>ICAO/IATA: <span>{flight.destination.icao}/{flight.destination.iata}</span></li>
                            <li>Type: <span>{flight.destination.type}</span></li>
                            <li>Name: <span>{flight.destination.name}</span></li>
                            <li>Location: <span>{flight.destination.continent}, {flight.destination.country}, {flight.destination.region}, {flight.destination.municipality}</span></li>
                            <li>Timezone: <span>{flight.destination.timezone}</span></li>
                        </ul>
                    </>
                    }
                </div>

                <div className="container">
                    <Subheading text="Other" />
                    { editMode ?
                    <>
                        <p>Seat: <Select name="seat" options={[
                            { text: flight.seat, value: "" },
                            { text: "Aisle", value: "aisle" },
                            { text: "Middle", value: "middle" },
                            { text: "Window", value: "window" }
                        ]} /></p>
                        <p>Aircraft Side: <Select name="aircraftSide" options={[
                            { text: flight.aircraftSide, value: "" },
                            { text: "Left", value: "left" },
                            { text: "Right", value: "right" },
                            { text: "Center", value: "center" }
                        ]} /></p>
                        <p>Class: <Select name="ticketClass" options={[
                            { text: flight.ticketClass, value: "" },
                            { text: "Private", value: "private" },
                            { text: "First", value: "first" },
                            { text: "Business", value: "business" },
                            { text: "Economy+", value: "economy+" },
                            { text: "Economy", value: "economy" }
                        ]} /></p>
                        <p>Purpose: <Select name="purpose" options={[
                            { text: flight.purpose, value: "" },
                            { text: "Leisure", value: "leisure" },
                            { text: "Business", value: "business" },
                            { text: "Crew", value: "crew" },
                            { text: "Other", value: "other" }
                        ]} /></p>
                        <p>Airplane: <Input type="text" name="airplane" placeholder={flight.airplane} /></p>
                        <p>Airline: <SearchInput name="airline" type="airlines" placeholder={flight.airline} /></p>
                        <p>Tail Number: <Input type="text" name="tail_Number" placeholder={flight.tailNumber} /></p>
                        <p>Flight Number: <Input type="text" name="flightNumber" placeholder={flight.flightNumber} /></p>
                        <p>Notes</p>
                        <TextArea name="notes" defaultValue={flight.notes}/>
                    </>
                    :
                    <>
                        <p>Seat: <span>{flight.seat || "N/A"}</span></p>
                        <p>Aircraft Side: <span>{flight.aircraftSide || "N/A"}</span></p>
                        <p>Class: <span>{flight.ticketClass || "N/A"}</span></p>
                        <p>Purpose: <span>{flight.purpose || "N/A"}</span></p>
                        <p>Airplane: <span>{flight.airplane || "N/A"}</span></p>
                        <p>Airline: <span>{flight.airline ? flight.airline.icao + " - " + flight.airline.name : "N/A"}</span></p>
                        <p>Flight Number: <span>{flight.flightNumber || "N/A"}</span></p>
                        <p>Notes: {flight.notes ?  <p className="whitespace-pre-line inline">{flight.notes}</p> : "N/A"}</p>
                    </>}
                </div>
            </div>

            { editMode &&
                <Button text="Save" 
                        level="success" 
                        submit/>
            }
            { selfUsername === flight.username &&
                <>
                <Button text={editMode ? "Cancel" : "Edit" } level="default" onClick={toggleEditMode} />
                <Button text="Delete" level="danger" onClick={deleteFlight} />
                </>
            }
            </form>
        </>
    );
}
