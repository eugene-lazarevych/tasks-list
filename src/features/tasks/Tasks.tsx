import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  getTasksAsync,
  selectTodoTasks,
  selectDoneTasks,
} from './tasksSlice';

interface Item {
  key?: string;
  title: string;
  status: string;
}
interface ITaskList {
  [k: string]: Item[];
}
interface IId2List {
  [k: string]: string;
}

const id2List = {
  droppable: 'todoTasks',
  droppable2: 'doneTasks'
} as IId2List;

const reorder = (list: Item[], startIndex: number, endIndex: number):Item[] => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (source: Item[], destination: Item[], droppableSource:DraggableLocation, droppableDestination:DraggableLocation):ITaskList | any => {
  const sourceClone = [...source];
  const destClone = [...destination];
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  let result:ITaskList = {} as ITaskList;
  if (droppableSource.droppableId === 'droppable') {
    result = { doneTasks: destClone, todoTasks: sourceClone };
  } else {
    result = { todoTasks: destClone, doneTasks: sourceClone };
  }

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any):{} => ({
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
    },
    crossedOut: {
      textDecoration: 'line-through',
    },
  }),
);

export function Tasks() {
  const todoTasks = useAppSelector(selectTodoTasks);
  const doneTasks = useAppSelector(selectDoneTasks);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [taskColumns, setTaskColumns] = useState<ITaskList>({ todoTasks, doneTasks })

  useEffect(() => {
    dispatch(getTasksAsync());
  }, [dispatch]);

  useEffect(() => {
    setTaskColumns({ todoTasks, doneTasks });
  }, [todoTasks, doneTasks]);

  const getList = (id:string):Item[] => {
    return taskColumns[id2List[id]];
  }

  const onDragEnd = (result: DropResult) => {
      const { source, destination } = result;

      if (!destination) {
          return;
      }

      if (source.droppableId === destination.droppableId) {
          const items = reorder(
              getList(source.droppableId),
              source.index,
              destination.index
          );

          let updatedTaskColumns:ITaskList = { ...taskColumns };

          if (source.droppableId === "droppable2") {
            updatedTaskColumns = { ...taskColumns, doneTasks: items };
          } else if (source.droppableId === "droppable") {
            updatedTaskColumns = { ...taskColumns, todoTasks: items };
          }
          setTaskColumns({ ...updatedTaskColumns });
      } else {
          const result:ITaskList = move(
              getList(source.droppableId),
              getList(destination.droppableId),
              source,
              destination
          );
          setTaskColumns({ todoTasks: result.todoTasks, doneTasks: result.doneTasks });
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
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <Paper
                elevation={0}
                variant="outlined"
                className={`${classes.column} ${snapshot.isDraggingOver ? classes.columnDraggingOver : ''}`}
                ref={provided.innerRef}
              >
                {taskColumns.todoTasks.map((item, index) => (
                  <Draggable
                    key={item.key}
                    draggableId={item.key as string}
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
          <Droppable droppableId="droppable2">
            {(provided, snapshot) => (
              <Paper
                elevation={0}
                variant="outlined"
                className={`${classes.column} ${snapshot.isDraggingOver ? classes.columnDraggingOver : ''}`}
                ref={provided.innerRef}
              >
                {taskColumns.doneTasks.map((item, index) => (
                  <Draggable
                    key={item.key}
                    draggableId={item.key as string}
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
                          <Typography variant="h6" component="h3" className={classes.crossedOut}>
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
        </DragDropContext>
      </Container>
    </div>
  );
}
