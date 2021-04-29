import Head from "next/head";
import Image from "next/image";
import styles from "./styles.module.css";
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { useEffect, useState } from "react";
import _ from "lodash";

const SignInScreen = () => {
  const [model, setModel] = useState(null);
  const [action, setAction] = useState(null);
  const [labels, setLabels] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [verified, setVerified] = useState(false);

  const argMax = (array) => {
    return _.reduce(
      _.map(array, (x, i) => {
        return [x, i];
      }),
      (r, a) => {
        return a[0] > r[0] ? a : r;
      }
    )[1];
  };

  const loadModel = async () => {
    // start loading model
    const recognizer = await speech.create("BROWSER_FFT");
    // check if model is loaded
    await recognizer.ensureModelLoaded();
    // store model instance to state
    setModel(recognizer);
    // store command word list to state
    setLabels(recognizer.wordLabels());
  };

  const startSpeak = async () => {
    console.log("Listening for commands");
    setSpeaking(true);
    // start model and listen for command
    model.listen(
      (result) => {
        // print result
        console.log(result.spectrogram);

        // METHOD 1
        // add argMax function
        setAction(labels[argMax(Object.values(result.scores))]);

        // METHOD 2
        // const answer = _.map(result.scores, (s, i) => {
        //   return { score: s, word: labels[i] };
        // });
        // console.log("answer: ", answer);
        // console.log(
        //   "sort: ",
        //   _.last(
        //     _.sortBy(answer, (s) => {
        //       return s.score;
        //     })
        //   )
        // );
      },
      { includeSpectrogram: true, probabilityThreshold: 0.9 }
    );
    // set timeout after which the stops listening
  };

  const stopSpeak = () => {
    model.stopListening();
    setSpeaking(false);
  };

  useEffect(() => {
    loadModel();
  }, []);

  // console.log("model: ", model);
  console.log("labels: ", labels);
  // console.log("action: ", action);
  // console.log("test argMax: ", argMax([5.2, 1.4, 9.6, 1.8, 3.2, 2.4]));
  return (
    <div className={styles.container}>
      <Head>
        <title>VB-CAPTCHA</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <form class="container is-fluid">
          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input class="input" type="text" placeholder="Username" />
            </div>
          </div>
          <div class="field">
            <label class="label">Password</label>
            <div class="control">
              <input class="input" type="password" placeholder="Password" />
            </div>
          </div>
          <div class="box is-flex is-justify-content-center">
            {speaking ? (
              <button className={styles.button} onClick={stopSpeak}>
                <Image src="/pause.svg" alt="record" width={64} height={64} />
              </button>
            ) : (
              <button className={styles.button} onClick={startSpeak}>
                <Image src="/record.svg" alt="record" width={64} height={64} />
              </button>
            )}
          </div>

          <div class="control">
            <button class="button is-link" disabled={!verified}>
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SignInScreen;
