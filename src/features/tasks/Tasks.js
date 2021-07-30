import React, { useState, useEffect } from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DragUpdate } from 'react-beautiful-dnd';
import { TaskInterface } from './tasksSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  markAsDone,
  markAsTodo,
  getTasksAsync,
  selectTodoTasks,
  selectDoneTasks,
} from './tasksSlice';
import { TaskCard } from './TaskCard';

const reorder = (list, droppableId, startIndex, endIndex) => {
    const result = Array.from(list[droppableId]);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { ...list, [droppableId]: result};
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging ? '#bbeebb' : '#eeeeee',
    ...draggableStyle
});

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    board: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      '& > *': {
        margin: theme.spacing(1),
        width: theme.spacing(40),
      },
    },
    column: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: theme.spacing(2),
      '& > *': {
        margin: theme.spacing(1),
        width: theme.spacing(30),
        height: theme.spacing(16),
      },
    },
    columnDraggingOver: {
      background: 'lightblue',
    }
  }),
);

export function Tasks() {
  const todoTasks = useAppSelector(selectTodoTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [taskColumns, setTaskColumns] = useState({ todoTasksColumn: todoTasks, doneTasksColumn: doneTasks })

  useEffect(() => {
    dispatch(getTasksAsync());
  }, []);

  useEffect(() => {
    setTaskColumns({ todoTasksColumn: todoTasks, doneTasksColumn: doneTasks });
  }, [todoTasks, doneTasks]);

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                taskColumns,
                source.droppableId,
                source.index,
                destination.index
            );
            console.log(items);
            setTaskColumns({ todoTasksColumn: items.todoTasksColumn, doneTasksColumn: items.doneTasksColumn });
        } else {
            const result = move(
                taskColumns[source.droppableId],
                taskColumns[destination.droppableId],
                source,
                destination
            );
            setTaskColumns({ todoTasksColumn: result.todoTasksColumn, doneTasksColumn: result.doneTasksColumn });
        }
    };

    return (
      <div className={classes.root}>
        <CssBaseline />
        <Typography variant="h3" gutterBottom>
          Tasks list.
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Drag and drop cards to change task status.
        </Typography>
        <Container maxWidth="md" className={classes.board}>
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.values(taskColumns).map((column, columnIndex) => (
              <Droppable droppableId={Object.keys(taskColumns)[columnIndex]} key={`column${columnIndex}`}>
                {(provided, snapshot) => (
                  <Paper
                    elevation={0}
                    variant="outlined"
                    className={`${classes.column} ${snapshot.isDraggingOver ? classes.columnDraggingOver : ''}`}
                    ref={provided.innerRef}
                  >
                    {column.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                            )}>
                            <CardContent>
                              <Typography variant="h6" component="h3">
                                {item.title}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </Container>
      </div>
    );
}
