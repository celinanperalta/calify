import * as firebase from "firebase";
import "firebase/database";
import * as config from "./config.json"

firebase.initializeApp(config["firebase"]);

export default firebase.database();