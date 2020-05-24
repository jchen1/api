import Head from "next/head";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "./header";

const Container = styled.div`
  min-height: 100vh;
  max-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 740px;
  width: 100%;
  margin: 0 auto;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin: 0 0 1rem 0;
`;

const EventCard = styled.div`
  padding: 0.5rem 0.5rem 0.5rem 0;
  text-align: left;
  text-decoration: none;

  h3,
  p {
    margin: 0;
  }
  display: flex;
  flex-direction: column;
  justify-content: center;

  p,
  em {
    font-size: 0.8rem;
  }
`;

const FeedContainer = styled.div`
  padding: 0 2rem;
  max-height: 60rem;
  flex: 1;
`;

const EventContainer = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const WidgetContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

function prettifyData(data) {
  return isNaN(data) ? data : +data.toFixed(2);
}

function Event({ event }) {
  const title =
    event.data === "hidden"
      ? event.event
      : `${event.event} - ${prettifyData(event.data)}`;
  return (
    <EventCard
      key={`${event.event}.${event.source.major}.${event.source.minor}.${event.time}`}
    >
      <h3>{title}</h3>
      <p>{event.time}</p>
      <em>
        {event.source.major} - {event.source.minor}
      </em>
    </EventCard>
  );
}

export default function Home() {
  const [events, setEvents] = useState({ all: [] });

  useEffect(() => {
    const ws = new WebSocket(
      // "wss://api.jeffchen.dev:444" ||
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9001"
    );

    ws.onmessage = event => {
      const response = JSON.parse(event.data);
      setEvents(events =>
        response.events.reduce(
          (acc, event) => {
            if (!acc.hasOwnProperty("all")) {
              acc.all = [];
            }
            acc.all.push(event);

            if (!acc.hasOwnProperty(event.event)) {
              acc[event.event] = [];
            }
            acc[event.event].push(event);
            return acc;
          },
          { ...events }
        )
      );
    };
    ws.onclose = () => ws.close();

    return () => ws.close();
  });

  const eventRows = events.all
    .slice(events.all.length - 50)
    .reverse()
    .map(event => Event({ event }));

  const types = {
    hr: "Heart Rate (bpm)",
    awair_score: "Awair Score",
    co2: "CO2 (ppm)",
    temp: "Temperature (°F)",
    voc: "VOC (ppb)",
    humid: "Humidity (%)",
  };
  const miniWidgets = Object.keys(types).map(type => {
    const lastOfType = events[type]
      ? events[type][events[type].length - 1]
      : {};

    return (
      <>
        <h2>{types[type]}</h2>
        <p>{prettifyData(lastOfType.data) || "---"}</p>
      </>
    );
  });

  const widgets = (
    <WidgetContainer>
      <FeedContainer>
        <h2>Raw Event Feed</h2>
        <EventContainer>{eventRows}</EventContainer>
      </FeedContainer>
      <FeedContainer>
        <h2>Events Received</h2>
        <p>{events.all.length}</p>
        {miniWidgets}
      </FeedContainer>
    </WidgetContainer>
  );

  return (
    <Container>
      <Head>
        <title>Jeff's Events</title>
        <link rel="icon" href="https://www.jeffchen.dev/favicon.ico" />
      </Head>

      <Header></Header>

      <Main>
        <Title>Events</Title>
        {events.all.length === 0
          ? "Waiting for events... maybe Jeff is asleep..."
          : widgets}
      </Main>
    </Container>
  );
}
