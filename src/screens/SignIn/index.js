import Head from "next/head";
import Image from "next/image";
import styles from "./styles.module.css";
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { useEffect, useState } from "react";
import _ from "lodash";

const SignInScreen = () => {
  // ============================================  STATES
  const [model, setModel] = useState(null);
  const [action, setAction] = useState(null);
  const [labels, setLabels] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [counter, setCounter] = useState(0);
  const [answerOne, setAnswerOne] = useState(null);
  const [answerTwo, setAnswerTwo] = useState(null);
  const [questionOne, setQuestionOne] = useState(null);
  const [questionTwo, setQuestionTwo] = useState(null);

  // ============================================  FUNCTIONS
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

  const loadQuestion = () => {
    let options = _.compact(
      _.map(labels, (option) => {
        if (!_.includes(option, "_")) {
          return option;
        }
        return null;
      })
    );

    let quizOne = options[_.random(options.length - 1, false)];
    options = _.compact(
      _.map(options, (option) => {
        if (option === quizOne) {
          return null;
        }
        return option;
      })
    );
    setQuestionOne(quizOne);
    let quizTwo = options[_.random(options.length - 1, false)];
    setQuestionTwo(quizTwo);
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

  const startSpeak = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setSpeaking(true);
    // start model and listen for speech
    model.listen(
      (result) => {
        // METHOD 1
        // argMax function
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
  };

  const stopSpeak = (e) => {
    if (e) {
      e.preventDefault();
    }
    model.stopListening();
    setSpeaking(false);
  };

  const refresh = (e) => {
    if (e) {
      e.preventDefault();
    }
    loadQuestion();
  };

  const verify = () => {
    console.log("captcha question: ", questionOne, " ", questionTwo);
    console.log("captcha answer: ", answerOne, " ", answerTwo);
    if (answerOne === questionOne && answerTwo === questionTwo) {
      setVerified(true);
    }
  };

  // ============================================  EFFECTS
  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (!_.isEmpty(labels)) {
      loadQuestion();
    }
  }, [labels]);

  useEffect(() => {
    if (!_.isEmpty(action)) {
      if (counter === 0) {
        setAnswerOne(action);
        setCounter(1);
      }
      if (counter === 1) {
        setAnswerTwo(action);
        setCounter(0);
        stopSpeak();
        verify();
        setAction(null);
      }
    }
  }, [action]);

  // ============================================  RENDER
  return (
    <div className={styles.container}>
      <Head>
        <title>VB-CAPTCHA</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <form className="container is-fluid">
          <div className="field">
            <label className="label">Username</label>
            <div className="control">
              <input className="input" type="text" placeholder="Username" />
            </div>
          </div>
          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input className="input" type="password" placeholder="Password" />
            </div>
          </div>
          <div className="box is-flex is-flex-direction-column is-justify-content-center mx-6">
            {verified ? (
              <Image src="/ok.svg" alt="record" width={128} height={128} />
            ) : (
              <>
                <div className="box is-flex is-justify-content-center mx-6 is-size-2">
                  {questionOne} {questionTwo}
                </div>
                <div className="columns">
                  <div className="column is-half is-flex is-justify-content-center">
                    <button className={styles.button} onClick={refresh}>
                      <Image
                        src="/refresh.svg"
                        alt="refresh"
                        width={64}
                        height={64}
                      />
                    </button>
                  </div>
                  <div className="column is-half is-flex is-justify-content-center">
                    {speaking ? (
                      <button className={styles.button} onClick={stopSpeak}>
                        <Image
                          src="/pause.svg"
                          alt="pause"
                          width={64}
                          height={64}
                        />
                      </button>
                    ) : (
                      <button className={styles.button} onClick={startSpeak}>
                        <Image
                          src="/record.svg"
                          alt="record"
                          width={64}
                          height={64}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="control">
            <button className="button is-link" disabled={!verified}>
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

// ============================================  EXPORT
export default SignInScreen;
