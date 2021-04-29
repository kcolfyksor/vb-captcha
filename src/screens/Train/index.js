import Head from "next/head";
import Link from "next/link";
import styles from "./styles.module.css";
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { useEffect, useState } from "react";
import _ from "lodash";

const TrainScreen = () => {
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
        </div>
      </main>
    </div>
  );
};

export default TrainScreen;
