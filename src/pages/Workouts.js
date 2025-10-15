import { NavLink } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Notyf } from "notyf";

const notyf = new Notyf();

export default function Workouts() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [formActive, setFormActive] = useState(false);

  const fetchWorkouts = () => {
    fetch("https://fitnessapp-api-ln8u.onrender.com/workouts/getMyWorkouts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.workouts) {
          setWorkouts(data.workouts);
        }
      });
  };

  function addWorkout(e) {
    e.preventDefault();
    let userId;
    fetch('https://fitnessapp-api-ln8u.onrender.com/users/details', {
        headers: {
          Authorization: `Bearer ${ localStorage.getItem("token") }`
        }
    })
    .then(res => res.json())
    .then(data => {userId = data.user._id});

    fetch("https://fitnessapp-api-ln8u.onrender.com/workouts/addWorkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ localStorage.getItem("token") }`
      },
      body: JSON.stringify({
        userId: userId,
        name: workoutName,
        duration: workoutDuration
      })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
          notyf.success('Workout added successfully');
        } else {
          notyf.error(`Add workout error: ${data.error}`);
        }
        setShowModal(false);
        setWorkoutName("");
        setWorkoutDuration("");
        fetchWorkouts();
    });
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    } else {
      fetchWorkouts();
    }
  }, []);

  useEffect(() => {
    if (workoutName !== "" && workoutDuration !== "") {
      setFormActive(true);
    } else {
      setFormActive(false);
    }
  }, [workoutName, workoutDuration])

  return (
    <div id="home" className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success fw-bold">Workouts</h2>
      </div>

      <hr />

      {!workouts.length ? (
        <div>
          <h5 className="text-center">No Workouts.</h5>
        </div>
      ) : (
        workouts.map((workout) => {
          return (
            <div className="card p-4 mb-2" key={workout._id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bolder">{workout.name}</h4>
                  <h5>{workout.duration}</h5>
                  <span className="d-block mt-3">{workout.status}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div className="d-flex justify-content-end">
        <Button onClick={() => setShowModal(true)}>Add Workout</Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Workout</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form onSubmit={(e) => addWorkout(e)}>
            <Form.Group controlId="workoutName">
              <Form.Label>Workout Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="workoutDuration">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter duration"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            {formActive ? (
              <Button variant="primary" type="submit" id="submitBtn">
                Submit
              </Button>
            ) : (
              <Button variant="danger" type="submit" id="submitBtn" disabled>
                Submit
              </Button>
            )}
          </Form>

        </Modal.Body>
      </Modal>
    </div>
  );
}
