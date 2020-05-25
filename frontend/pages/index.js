import Head from "next/head";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "./header";
import Event from "./event";
import Widget, { typeOrder } from "./widget";

const Container = styled.div`
  min-height: 100vh;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin: 0 0 1rem 0;
`;

const FeedContainer = styled.div`
  padding: 0 2rem;
  max-height: 60rem;
  flex: 1 1 33%;
  @media screen and (max-width: 640px) {
    flex: 1 1 100%;
  }
`;

const WidgetContainer = styled.div`
  padding: 0 2rem;
  flex: 1 1 67%;
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 640px) {
    flex: 1 1 100%;
  }
`;

const EventContainer = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
  @media screen and (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

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

  const miniWidgets = Object.keys(events)
    .sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
    .map(type => (
      <Widget key={type} type={type} events={events[type]}></Widget>
    ));

  const widgets = (
    <InnerContainer>
      <WidgetContainer>{miniWidgets}</WidgetContainer>
      <FeedContainer>
        <h2>Raw Event Feed ({events.all.length} received)</h2>
        <EventContainer>{eventRows}</EventContainer>
      </FeedContainer>
    </InnerContainer>
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
