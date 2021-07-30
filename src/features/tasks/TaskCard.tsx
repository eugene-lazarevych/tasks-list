import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: theme.spacing(30),
    },
  })
);

export function TaskCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root} {...props}>
      <CardContent>
        <Typography variant="h6" component="h3">
          {props.task.title}
        </Typography>
      </CardContent>
    </Card>
  );
}
