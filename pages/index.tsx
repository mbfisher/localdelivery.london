import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  makeStyles,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { onSnapshot } from "mobx-state-tree";
import React, { useState, useEffect } from "react";
import { AppBar } from "../src/components/AppBar";
// import makeInspectable from "mobx-devtools-mst";
import { createRootStore, StoreContext } from "../src/store";
import dynamic from "next/dynamic";
import { SearchResults } from "../src/components/SearchResults";

const Map = dynamic(
  () => import("../src/components/Map").then(mod => mod.Map),
  {
    ssr: false
  }
);

const useStyles = makeStyles(theme => ({
  map: {
    position: "fixed",
    width: "100vw",
    height: "67vh",
    [theme.breakpoints.up("sm")]: {
      width: "67vw"
    }
  },
  results: {
    position: "absolute",
    width: "100vw",
    top: "67vh",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      minHeight: "100vh",
      width: "33vw",
      top: 64,
      right: 0
    }
  }
}));

const Popup = ({ onClose }) => (
  <Dialog aria-labelledby="new-user-dialog-title" open={true}>
    {/* <Typography variant="h6"> */}
    <DialogTitle id="new-user-dialog-title">
      London Local Deliveries
    </DialogTitle>
    {/* </Typography> */}
    <DialogContent>
      <DialogContentText id="new-user-dialog-description">
        <Typography paragraph>
          Independent businesses all over London have been forced to close their
          doors and are brilliantly offering delivery services to their local
          communities. Over the next few weeks we're going to need them, and
          they need us!
        </Typography>
        <Typography paragraph>
          Use this site to find businesses that are delivering near you.
        </Typography>
        <Typography paragraph>
          Use the plus button in the bottom corner to tell us about businesses
          we've missed.
        </Typography>
        <Typography paragraph>Stay safe x</Typography>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const useLandingDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    const isKnownUser = localStorage.getItem("known");
    console.log({ isKnownUser });

    if (isKnownUser) {
      return setShowDialog(false);
    }

    localStorage.setItem("known", "true");
    setShowDialog(true);
  }, []);

  return [showDialog, () => setShowDialog(false)];
};

function App() {
  const styles = useStyles();
  const [showDialog, closeDialog] = useLandingDialog();

  return (
    <>
      <AppBar />
      <Map className={styles.map} />
      <SearchResults className={styles.results} />
      <Box position="fixed" bottom={0} right={0} m={2}>
        <Fab
          color="primary"
          href="https://forms.gle/Vn6kbWaU5p4aBdS49"
          target="_blank"
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </Box>
      {showDialog && <Popup onClose={closeDialog} />}
    </>
  );
}

const rootStore = createRootStore();
onSnapshot(rootStore, snapshot => console.log("Snapshot: ", snapshot));
// makeInspectable(rootStore);

export default () => (
  <StoreContext.Provider value={rootStore}>
    <App />
  </StoreContext.Provider>
);
