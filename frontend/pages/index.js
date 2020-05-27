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

const TitleContainer = styled.div`
  display: flex;
  margin: 0 0 1rem 0;
  align-items: center;
  justify-content: space-evenly;

  h1 {
    font-size: 3rem;
    margin: 0;
  }
`;

const WSIndicator = styled.div`
  background-color: ${props => props.color};
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  display: inline-block;
  margin-left: 1rem;
`;

const FeedContainer = styled.div`
  padding: 0 2rem;
  max-height: 40rem;
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

const Label = styled.label`
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  border-radius: 5px 0 0 5px;
  border: 1px solid #d8d8d8;
  border-right: 0;
  background-color: white;
  cursor: text;
  flex-grow: 1;
  margin: 0;

  input {
    -webkit-appearance: none;
    border: none;
    outline: 0;
    padding: 0;
    font-size: 1rem;
    padding: 0 0.5rem;
    font-family: inherit;
  }
`;

const Button = styled.button`
  height: 2.5rem;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  background-color: #f03009;
  text-align: center;
  text-transform: uppercase;
  outline: 0;
  border: 1px solid #f03009;
  letter-spacing: 0.15rem;
  padding: 0 1rem;
  border-radius: 0 5px 5px 0;
  color: white;
  transition: background ease-in 0.2s;
  flex-grow: 1;
  margin: 0;

  &:hover {
    background-color: #bd0000;
    border-color: #bd0000;
  }
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

function InputContainer({ ws }) {
  const [message, setMessage] = useState("");

  function submit(e) {
    e.preventDefault();
    ws.send(JSON.stringify({ type: "message", message }));
    setMessage("");
  }

  return (
    <>
      <h2>Send an event!</h2>
      <Form onSubmit={submit}>
        <Label key="a">
          <input
            key="b"
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></input>
        </Label>
        <Button>Send</Button>
      </Form>
    </>
  );
}

function connect(setEvents, setWs) {
  const ws = new WebSocket(
    "wss://api.jeffchen.dev:444" ||
      process.env.NEXT_PUBLIC_WS_URL ||
      "ws://localhost:9001"
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

  ws.onclose = () =>
    setTimeout(() => {
      const ws = connect(setEvents, setWs);
      return setWs(ws);
    }, 1000);

  return ws;
}

export default function Home() {
  const [events, setEvents] = useState({ all: [] });
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = connect(setEvents, setWs);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "connect" }));
    };

    setWs(ws);
    return () => ws.close();
  }, []);

  const eventRows = events.all
    .slice(events.all.length - 50)
    .reverse()
    .map(event => Event({ event }));

  const socketColor = (function () {
    // if server-side rendered
    if (!ws) return "#f03009";

    const socketState = ws.readyState;
    switch (socketState) {
      case WebSocket.OPEN:
        return "#68b723";
      case WebSocket.CONNECTING:
        return "#f37329";
      // CLOSING/CLOSED/NULL
      default:
        return "#f03009";
    }
  })();

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
        <title>api.jeffchen.dev</title>
        <link rel="icon" href="https://www.jeffchen.dev/favicon.ico" />
      </Head>

      <Header></Header>

      <Main>
        <TitleContainer>
          <h1>Metrics</h1>
          <WSIndicator color={socketColor} />
        </TitleContainer>
        <InputContainer ws={ws}></InputContainer>

        {events.all.length === 0 ? "Loading..." : widgets}
      </Main>
    </Container>
  );
}
