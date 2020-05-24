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
`;

const Title = styled.h1`
  font-size: 4rem;
  margin: 0 0 3rem 0;
`;

const EventCard = styled.div`
  padding: 0.5rem 1.5rem;
  text-align: left;
  text-decoration: none;

  h3,
  p {
    margin: 0;
  }
`;

const EventContainer = styled.div`
  overflow-y: auto;
`;

function Event({ event }) {
  const title =
    event.data === "hidden" ? event.event : `${event.event} - ${event.data}`;
  return (
    <EventCard key={event.time}>
      <h3>{title}</h3>
      <em>
        {event.source.major} - {event.source.minor}
      </em>
      <p>{event.time}</p>
    </EventCard>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(
      "wss://api.jeffchen.dev:444" ||
        process.env.NEXT_PUBLIC_WS_URL ||
        "ws://localhost:9001"
    );

    ws.onmessage = event => {
      const response = JSON.parse(event.data);
      setEvents([response].concat(events));
    };
    ws.onclose = () => ws.close();

    return () => ws.close();
  });

  const eventRows = events.map(event => Event({ event }));

  const emptyMessage =
    events.length === 0 ? <p>Waiting for events...</p> : null;

  return (
    <Container>
      <Head>
        <title>Jeff's Events</title>
        <link rel="icon" href="https://www.jeffchen.dev/favicon.ico" />
      </Head>

      <Header></Header>

      <Main>
        <Title>Event Feed</Title>
        {emptyMessage}
        <EventContainer>{eventRows}</EventContainer>
      </Main>
    </Container>
  );
}
