import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Progress, Form } from 'antd';
import ChooseMembers from './Wizard/ChooseMembers';
import AnswerContexts from './Wizard/AnswerContexts';
import ReviewRequest from './Wizard/ReviewRequest';
import { postNewRequest } from '../../../api/index';
import {
  getCurrentTopic,
  addNewSurvey,
} from '../../../state/actions/apolloActions';

function Send(props) {
  const [form] = Form.useForm();

  // local state to change button deisplay if sent a survey today
  const [sent, setSent] = useState(false);
  // change the send button to sent if the date of the last created survey is the same day as today
  useEffect(() => {
    const d = new Date();
    const today = d.getDate();
    props.currentTopic.surveysrequests.forEach(request => {
      if (new Date(request.createdDate).getDate() === today) {
        setSent(true);
      }
    });
  }, [props.currentTopic]);

  // set state for modal visibility
  const [isVisible, setIsVisible] = useState(false);
  // function to close Modal
  const cancelModal = () => {
    setIsVisible(false);
  };

  // set localstate for progress
  const [progress, setProgress] = useState(25);
  const prevProgress = useRef(0); //store previous progress

  // function to move to next step in wizard
  const next = () => {
    // if on the first step: answer context questions
    // submit form to trigger validation
    form.submit();
  };

  // func to go back one step in wizard
  const prev = () => {
    if (progress === 50) {
      prevProgress.current += 25; // let onFinish know prev is clicked
      form.submit();
    } else {
      const subtractProgress = progress - 25;
      prevProgress.current = subtractProgress - 25;
      setProgress(subtractProgress);
    }
  };

  // set state for the current list of questions to send, initially set to the default questions for the topic
  const [questionsToSend, setQuestionsToSend] = useState([]);

  const reset = () => {
    let requestQuestions = [];
    let questions = props.currentTopic.defaultsurvey.questions
      ? props.currentTopic.defaultsurvey.questions
      : [];
    for (let i = 0; i < questions.length; i++) {
      requestQuestions.push({
        body: `${questions[i].body}`,
        type: `${questions[i].type}`,
        leader: questions[i].leader,
        answer: '',
      });
    }
    setQuestionsToSend(requestQuestions);
  };

  const handleChange = e => {
    // create new questionsToSend state array
    let newQuestionsToSend = JSON.parse(JSON.stringify(questionsToSend));
    newQuestionsToSend[e.target.name.charAt(0)][e.target.name.slice(1)] =
      e.target.value;

    // antd form values for validation
    form.setFieldsValue({ [e.target.name.charAt(0)]: e.target.value });
    setQuestionsToSend(newQuestionsToSend);
  };

  const onFinish = values => {
    // check form validation

    // next clicked and form is completed
    if (!values.errorFields && prevProgress.current < progress) {
      const addProgress = progress + 25;
      prevProgress.current = progress;
      setProgress(addProgress);
      // prev clicked and form is completed
    } else if (!values.errorFields && prevProgress.current >= progress) {
      const subtractProgress = progress - 25;
      prevProgress.current = subtractProgress - 25;
      setProgress(subtractProgress);
      // prev clicked and form is NOT completed
    } else if (values.errorFields && prevProgress.current >= progress) {
      prevProgress.current = progress - 25;
    }
  };

  const showModal = () => {
    setIsVisible(true);
    reset();
  };

  const submitNewRequest = () => {
    postNewRequest(
      props.currentTopic.topicId,
      questionsToSend,
      props.addNewSurvey
    )
      .then(() => {
        setIsVisible(false);
        setQuestionsToSend([]);
        setProgress(25);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {!sent && (
        <Button
          onClick={() => showModal()}
          style={{
            marginLeft: '1rem',
            backgroundColor: 'indigo',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          New Request
        </Button>
      )}
      {sent && (
        <Button
          style={{
            marginLeft: '1rem',
            backgroundColor: '#7e52c3',
            color: 'white',
            fontWeight: 'bold',
          }}
          disabled={true}
        >
          Sent
        </Button>
      )}
      <Modal
        title={[
          'Send New Request',
          <Progress key={`progress`} percent={progress}></Progress>,
        ]}
        visible={isVisible}
        onCancel={cancelModal}
        footer={[
          <span key={1}>
            {progress >= 50 && (
              <Button
                style={{
                  backgroundColor: 'indigo',
                  color: 'white',
                  fontWeight: 'bold',
                }}
                onClick={prev}
              >
                Previous
              </Button>
            )}
          </span>,
          <span key={2}>
            {progress <= 50 && (
              <Button
                style={{
                  backgroundColor: 'indigo',
                  color: 'white',
                  fontWeight: 'bold',
                }}
                onClick={next}
              >
                Next
              </Button>
            )}
          </span>,
          <span key={3}>
            {progress === 75 && (
              <Button
                style={{
                  backgroundColor: 'indigo',
                  color: 'white',
                  fontWeight: 'bold',
                }}
                onClick={submitNewRequest}
              >
                Send Request
              </Button>
            )}
          </span>,
        ]}
      >
        {progress === 25 && (
          <AnswerContexts
            form={form}
            questionsToSend={questionsToSend}
            setQuestionsToSend={setQuestionsToSend}
            handleChange={handleChange}
            onFinish={onFinish}
          />
        )}
        {progress === 50 && (
          <ChooseMembers
            form={form}
            questionsToSend={questionsToSend}
            setQuestionsToSend={setQuestionsToSend}
            handleChange={handleChange}
            onFinish={onFinish}
          />
        )}
        {progress === 75 && (
          <ReviewRequest
            questionsToSend={questionsToSend}
            setProgress={setProgress}
          />
        )}
      </Modal>
    </>
  );
}

const mapStateToProps = state => {
  return {
    ...state,
    currentTopic: state.currentTopic,
  };
};

export default connect(mapStateToProps, { getCurrentTopic, addNewSurvey })(
  Send
);
