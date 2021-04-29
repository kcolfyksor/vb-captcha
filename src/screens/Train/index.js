import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { useEffect, useState } from "react";
import _ from "lodash";

const TrainScreen = () => {
  const [base, setBase] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [name, setName] = useState("");
  const [nameConfirm, setNameConfirm] = useState(false);
  const [label, setLabel] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [allowTrain, setAllowTrain] = useState(false);
  const [allowDL, setAllowDL] = useState(false);
  const [dlName, setDLName] = useState(``);
  const [dlBlob, setDLBlob] = useState(null);
  const [dlReady, setDLReady] = useState(false);

  const loadBaseModel = async () => {
    // start loading model
    const baseRecognizer = await speech.create("BROWSER_FFT");
    // check if model is loaded
    await baseRecognizer.ensureModelLoaded();
    // store model instance to state
    setBase(baseRecognizer);
  };

  const createTransferModel = async () => {
    const transferRecognizer = await base.createTransfer(name);
    setTransfer(transferRecognizer);
  };

  const collect = async (word) => {
    if (transfer.isListening()) {
      return transfer.stopListening();
    }
    if (_.isEmpty(word)) {
      return;
    }

    await transfer.collectExample(word);
    setTimeout(() => {
      setSpeaking(false);
      setAllowTrain(true);
    }, 3000);
  };

  const train = async (e) => {
    if (e) {
      e.preventDefault();
    }
    await transfer.train({
      epochs: 25,
      callback: {
        onEpochEnd: async (epoch, logs) => {
          console.log(
            `Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`
          );
        }
      }
    });
    setAllowDL(true);
  };

  const startSpeak = (e) => {
    if (e) {
      e.preventDefault();
    }
    setSpeaking(true);
    collect(label);
  };

  const stopSpeak = (e) => {
    if (e) {
      e.preventDefault();
    }
    transfer.stopListening();
    setSpeaking(false);
  };

  const getDateString = () => {
    const d = new Date();
    const year = `${d.getFullYear()}`;
    let month = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }
    let hour = `${d.getHours()}`;
    if (hour.length < 2) {
      hour = `0${hour}`;
    }
    let minute = `${d.getMinutes()}`;
    if (minute.length < 2) {
      minute = `0${minute}`;
    }
    let second = `${d.getSeconds()}`;
    if (second.length < 2) {
      second = `0${second}`;
    }
    return `${year}-${month}-${day}T${hour}.${minute}.${second}`;
  };

  const prepareForDownload = () => {
    const basename = getDateString();
    const artifacts = transfer.serializeExamples();
    setDLName(`${basename}.bin`);
    setDLBlob(
      window.URL.createObjectURL(
        new Blob([artifacts], { type: "application/octet-stream" })
      )
    );
    setDLReady(true);
  };

  const onNameChange = (e) => {
    if (e.target.value) {
      setName(e.target.value);
      setNameConfirm(false);
    }
  };

  const onLabelChange = (e) => {
    if (e.target.value) {
      setLabel(e.target.value);
    }
  };

  const onClickNameConfirm = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!_.isEmpty(name)) {
      setNameConfirm(true);
      createTransferModel();
    }
  };

  const onClickPrepareDL = (e) => {
    if (e) {
      e.preventDefault();
    }
    prepareForDownload();
  };

  useEffect(() => {
    loadBaseModel();
  }, []);

  // console.log("ex: ", examples);
  console.log("trans: ", transfer);
  // console.log("nc: ", nameConfirm);

  return (
    <div className={styles.container}>
      <Head>
        <title>VB-CAPTCHA</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className="container is-fluid">
          <div className="tabs is-centered is-large is-fullwidth mb-6">
            <ul>
              <li>
                <Link href="/">
                  <a>Home</a>
                </Link>
              </li>
              <li>
                <Link href="/signin">
                  <a>Sign In</a>
                </Link>
              </li>
              <li className="is-active">
                <Link href="/train">
                  <a>Train</a>
                </Link>
              </li>
            </ul>
          </div>
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Name"
                value={name}
                onChange={onNameChange}
              />
            </div>
          </div>
          <div className="container is-flex is-justify-content-center">
            <button
              className="button is-primary is-medium"
              onClick={onClickNameConfirm}
              disabled={nameConfirm}>
              Confirm
            </button>
          </div>
          <div className="field">
            <label className="label">Word</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Word"
                value={label}
                onChange={onLabelChange}
                disabled={!nameConfirm}
              />
            </div>
          </div>
          <div className="container is-flex is-justify-content-center">
            {speaking ? (
              <button className={styles.button} onClick={stopSpeak} disabled>
                <Image src="/pause.svg" alt="pause" width={64} height={64} />
              </button>
            ) : (
              <button
                className={styles.button}
                onClick={startSpeak}
                disabled={!nameConfirm}>
                <Image src="/record.svg" alt="record" width={64} height={64} />
              </button>
            )}
          </div>
          <div className="container is-flex is-justify-content-center my-6">
            <button
              className="button is-primary is-medium"
              onClick={train}
              disabled={!allowTrain}>
              Train Model
            </button>
          </div>
          <div className="container is-flex is-justify-content-center my-6">
            {dlReady ? (
              <button className="button is-link is-light is-medium">
                <a href={dlBlob} download={dlName}>
                  Download
                </a>
              </button>
            ) : (
              <button
                className="button is-primary is-light is-medium"
                onClick={onClickPrepareDL}
                disabled={!allowDL}>
                Prepare Download
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainScreen;
