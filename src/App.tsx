import React, {FC, useState} from 'react';

import './App.css';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DraggableLocation,
} from "react-beautiful-dnd";

enum CarType {
    S = 'S',
    M = 'M',
    L = 'L',
}

interface Car {
    id: string,
    name: string,
    type: CarType,
}

interface CarSlot {
    id: string,
    type: CarType,
    car?: Car,
    distance: [number, number, number],
    bay: number,
}

const outsideWorld: Car[] = [
    {
        id: "1",
        name: "Hilux",
        type: CarType.L,
    },
    {
        id: "2",
        name: "Wigo",
        type: CarType.S,
    },
    {
        id: "3",
        name: "Innova",
        type: CarType.M,
    },
    {
        id: "4",
        name: "Land Cruiser",
        type: CarType.L,
    },
    {
        id: "5",
        name: "Avanza",
        type: CarType.M,
    },
];

const parkings: CarSlot[] = [
        { id: '1', type: CarType.M, distance: [0,1,2], bay: 0 },
        { id: '2', type: CarType.S, distance: [0,1,2], bay: 0 },
        { id: '3', type: CarType.M, distance: [0,1,2], bay: 0 },
        { id: '4', type: CarType.M, distance: [1,0,1], bay: 0 },
        { id: '5', type: CarType.M, distance: [1,0,1], bay: 0 },
        { id: '6', type: CarType.S, distance: [1,0,1], bay: 0 },
        { id: '7', type: CarType.S, distance: [2,1,0], bay: 0 },
        { id: '8', type: CarType.L, distance: [2,1,0], bay: 0 },
        { id: '9', type: CarType.L, distance: [2,1,0], bay: 0 },
]

const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};
const move = (
    source: Car[],
    destination: Car[],
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);

    const [removed] = sourceClone.splice(droppableSource.index, 1);

    const parkingDest = parkings;
    const parkingDestClone = Array.from(parkingDest);
    const availableParking = parkingDestClone
        .filter(value => value.type === removed.type && !value.car)
        .sort((a , b) => {
            const index = +droppableDestination.droppableId - 1;
            if (a.distance[index] < b.distance[index]) return -1;
            return a.distance[index] > b.distance[index] ? 1 : 0;

        });
    if (availableParking.length > 0) {
        const id = availableParking[0].id;
        // @ts-ignore
        parkings.find(value => value.id === id).car = removed;
    }

    const result = {};
    // @ts-ignore
    result[droppableSource.droppableId] = sourceClone;
    // @ts-ignore
    result[droppableDestination.droppableId] = destClone;

    return result;
};
const grid = 8;
const getItemStyle = (isDragging: any, draggableStyle: any, isActive = false) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : isActive ? "dodgerblue" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
});
const getListStyle = (isDraggingOver: any, droppableId: number) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 200,
    minHeight: droppableId < 1 ? 250 : 100,
    maxHeight: droppableId < 1 ? NaN : 100,
    maxWidth: droppableId < 1 ? NaN : 250,
    border: '1px solid RED',
});
const App: FC = () => {

    const [carState, setCarState] = useState([outsideWorld, [],[],[]]);
    const [carSlotState, setCarSlotState] = useState([parkings, []]);

    const handleOnDragEnd = (result: any) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            const items = reorder(carState[sInd], source.index, destination.index) as Car[];
            const newState = [...carState];
            newState[sInd] = items;
            setCarState(newState);
        } else {
            const result = move(carState[sInd], carState[dInd], source, destination);
            const newState = [...carState];
            // @ts-ignore
            newState[sInd] = result[sInd];
            // @ts-ignore
            newState[dInd] = result[dInd];

            // setState(newState.filter(group => group.length));
            setCarState(newState);
        }
    }

    // @ts-ignore
    return (
        <div className="App" style={{ display: "flex" }}>
            <div  style={{ display: "flex" }}>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    {carState.map((carGroup, ind) => (
                        <Droppable key={ind} droppableId={`${ind}`}>
                            {(provided, snapshot) => (
                                <div>
                                    { ind < 1 ? (<p>Outside World</p>) : (<p>Entrance {`${ind}`}</p>)}
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={getListStyle(snapshot.isDraggingOver, ind)}
                                    >
                                        {carGroup.map((car, index) => (
                                            <Draggable
                                                key={car.id}
                                                draggableId={`${car.id}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div ref={provided.innerRef}
                                                         {...provided.draggableProps}
                                                         {...provided.dragHandleProps}
                                                         style={getItemStyle(
                                                             snapshot.isDragging,
                                                             provided.draggableProps.style,
                                                             true
                                                         )}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-around",
                                                            }}
                                                        >
                                                            { `${car.name} (${car.type})` }
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </DragDropContext>
            </div>
            <div style={{ display: "flex" }}>
                <DragDropContext onDragEnd={ () => {}}>
                    {carSlotState.map((carSlots, ind) => (
                        <Droppable key={ind} droppableId={`${ind}`}>
                            {((provided, snapshot) => (
                                <div>
                                    { ind < 1 ? (<p>Parking</p>) : (<p>Exit</p>)}
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={getListStyle(snapshot.isDraggingOver, ind)}
                                    >
                                        <div>
                                            {carSlots.map((carSlot, index) => (
                                                <Draggable
                                                    key={carSlot.id}
                                                    draggableId={`${carSlot.id}`}
                                                    index={index}
                                                    isDragDisabled={carSlot.car === undefined}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef}
                                                             {...provided.draggableProps}
                                                             {...provided.dragHandleProps}
                                                             style={getItemStyle(
                                                                 snapshot.isDragging,
                                                                 provided.draggableProps.style,
                                                                 carSlot.car !== undefined
                                                             )}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-around",
                                                                }}
                                                            >
                                                                { `${carSlot.car?.name ?? 'empty'}` }
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Droppable>
                    ))}
                </DragDropContext>
            </div>
        </div>
    )
};

export default App;