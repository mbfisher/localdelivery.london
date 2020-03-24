import { IconButton } from "@material-ui/core";
import MaterialAppBar from "@material-ui/core/AppBar";
import InputBase from "@material-ui/core/InputBase";
import {
  createStyles,
  fade,
  makeStyles,
  Theme
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import React, { useState } from "react";
import { useStore } from "../src/store";

interface StyleProps {
  searchButtonActive: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    toolbar: {
      height: 64
    },
    menuButton: {
      padding: theme.spacing(1, 0),
      color: "inherit"
    },
    search: {
      padding: theme.spacing(0, 1),
      marginLeft: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15)
    },
    inputRoot: {
      color: "inherit"
    },
    input: {
      width: "10em"
      // backgroundColor: "white",
      // padding: 0
    },
    searchButton: props => ({
      padding: theme.spacing(1, 0, 1, 1),
      color: props.searchButtonActive
        ? "inherit"
        : fade(theme.palette.common.white, 0.33)
    })
  })
);

export function AppBar() {
  const [inputValue, setInputValue] = useState("");
  const classes = useStyles({ searchButtonActive: inputValue.length > 0 });
  const store = useStore();
  const inputRef = React.createRef<HTMLInputElement>();

  const onSubmit: React.FormEventHandler = async event => {
    console.log(`Resolving postcode ${inputValue}`);
    event.preventDefault();

    const response = await fetch(
      `https://api.postcodes.io/postcodes/${inputValue}`
    );
    const { result } = await response.json();
    console.log({ result });
    await store.query.setLocation({
      lon: result.longitude,
      lat: result.latitude
    });

    inputRef.current!.blur();
  };

  return (
    <div className={classes.grow}>
      <MaterialAppBar position="static">
        <Toolbar className={classes.toolbar}>
          <IconButton className={classes.menuButton} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <form onSubmit={onSubmit} className={classes.search} action="search">
            <InputBase
              placeholder="Enter your postcode"
              classes={{
                root: classes.inputRoot,
                input: classes.input
              }}
              inputProps={{ "aria-label": "search" }}
              inputRef={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <IconButton
              type="submit"
              className={classes.searchButton}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </form>
        </Toolbar>
      </MaterialAppBar>
    </div>
  );
}

/**
<form onSubmit={onSubmit}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Enter your postcode"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
                inputProps={{ "aria-label": "search" }}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              {showSubmitButton && (
                <Button color="inherit" type="submit">
                  Go
                </Button>
              )}
            </div>
          </form>*/
