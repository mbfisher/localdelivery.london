import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  makeStyles,
  Paper,
  Typography
} from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GroceryIcon from "@material-ui/icons/LocalGroceryStore";
import { useObserver } from "mobx-react-lite";
import React, { ReactNode, useState } from "react";
import { BusinessEntryModelType, useStore } from "../store";
import RestaurantIcon from "@material-ui/icons/Restaurant";
import LocalBarIcon from "@material-ui/icons/LocalBar";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(2)
  },
  card: {
    marginBottom: theme.spacing(2)
  },
  description: {
    marginTop: theme.spacing(1)
  },
  goButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1)
  }
}));

const Items = {
  Groceries: (
    <Chip
      size="small"
      variant="outlined"
      icon={<GroceryIcon style={{ marginLeft: 5 }} />}
      label="Groceries"
      key="Groceries"
      style={{ marginRight: 5 }}
    />
  ),
  Restaurant: (
    <Chip
      size="small"
      variant="outlined"
      icon={<RestaurantIcon style={{ marginLeft: 5 }} />}
      label="Restaurant"
      key="Restaurant"
      style={{ marginRight: 5 }}
    />
  ),
  Alcohol: (
    <Chip
      size="small"
      variant="outlined"
      icon={<LocalBarIcon style={{ marginLeft: 5 }} />}
      label="Alcohol"
      key="Alcohol"
      style={{ marginRight: 5 }}
    />
  ),
  "Prepared meals": (
    <Chip
      size="small"
      variant="outlined"
      icon={<RestaurantIcon style={{ marginLeft: 5 }} />}
      label="Prepared meals"
      key="Prepared meals"
      style={{ marginRight: 5 }}
    />
  ),
  Other: (
    <Chip
      size="small"
      variant="outlined"
      icon={<LocalShippingIcon style={{ marginLeft: 5 }} />}
      label="Other"
      key="Other"
      style={{ marginRight: 5 }}
    />
  )
};

const shortDescriptionLength = 80;

interface BusinessCardProps {
  business: BusinessEntryModelType;
}

function BusinessCard({ business }: BusinessCardProps) {
  const styles = useStyles();
  const [showMore, setShowMore] = useState(false);

  let description: ReactNode = business.description;

  if (
    business.description &&
    business.description.length > shortDescriptionLength
  ) {
    description = (
      <>
        {showMore
          ? business.description
          : business.description.substring(0, shortDescriptionLength) + "..."}
        <IconButton size="small" onClick={() => setShowMore(!showMore)}>
          {showMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </>
    );
  }

  return (
    <Card key={business.name} className={styles.card}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {business.name}
        </Typography>
        {business.items.sort().map(item => Items[item])}
        {business.description && (
          <Typography variant="body2" className={styles.description}>
            {description}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          href={business.url}
          target="_blank"
        >
          Visit
        </Button>
      </CardActions>
    </Card>
  );
}

export function SearchResults({ className = "" }) {
  const styles = useStyles();
  const { query } = useStore();

  return useObserver(() => {
    const { results } = query;
    console.log({ results: results.toJSON() });

    if (!results.length) {
      return null;
    }

    return (
      <Paper className={className}>
        <Typography variant="h5" component="h2" className={styles.title}>
          Local Businesses
        </Typography>
        {results.map(b => {
          console.log({ name: b.name, items: b.items.toJSON() });
          return <BusinessCard business={b} />;
        })}
      </Paper>
    );
  });
}
