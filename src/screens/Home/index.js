import Head from "next/head";
import Link from "next/link";
import styles from "./styles.module.css";
import _ from "lodash";

const HomeScreen = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>VB-CAPTCHA</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to VB-CAPTCHA</h1>
        <div>
          <Link href="/signin">
            <a>Sign In</a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
