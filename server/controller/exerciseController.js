import Exercise from "../model/exerciseModel.js";

const addExercise = async (req, res) => {
 
    try {
        const { title, exercises,sessionID } = req.body;
        const obj ={ title, exercises,sessionID }
        const exercise = new Exercise(obj);
        const result = await exercise.save();
        res.status(200).json({
          status: 'success',
          result
        });
      } catch (error) {
        res.status(400).json({
          status: 'fail',
          error: error.message
        });
      }
  };
  const getExercises = async (req, res) => {
 
    try {
      const sessionID = req.params.id;
      const exercises = await Exercise.find({ sessionID: sessionID });
      res.status(200).json({
        status: 'success',
        details: exercises
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        error: error.message
      });
    }
  };
  export { addExercise,getExercises};
