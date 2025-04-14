import Application from "../model/applicationModel.js";

// CREATE A TRAINER APPLICATION
const createACoachApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      gender,
      hight,
      age,
      phone,
      workTime,
      photo,
    } = req.body;

    console.log(req.body);

    // is application alredy exist
    const oldApplication = await Application.findOne({ email: email });
    if (oldApplication) {
      return res.status(400).json({
        status: "fail",
        error: "application already exist wait for confirmation",
      });
    }

    if (
      !firstName ||
      !lastName ||
      !email ||
      !gender ||
      !hight ||
      !age ||
      !workTime ||
      !phone ||
      !photo
    ) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    const applicationData = {
      firstName,
      lastName,
      email,
      gender,
      hight,
      age,
      workTime,
      photo,
      phone,
    };

    const application = new Application(applicationData);
    const result = await application.save(application);

    res.status(200).json({
      status: "success",
      message: "your application submitted successfully",
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

export { createACoachApplication };
