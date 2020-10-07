import React, { useState, useEffect } from 'react';
import { SendButton, RespondButton } from '../Surveys/index';
import { Layout, PageHeader, Button, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { TopicCreation } from '../TopicCreation';
import { JoinTopic } from '../JoinTopic';
import { ResponseList } from '../Responses';
import { getTopicById } from '../../../api/index';
import { getCurrentTopic } from '../../../state/actions/apolloActions';
const { Content, Sider } = Layout;
const { Option } = Select;

function RenderHomePage(props) {
  const { authService, currentTopic } = props;
  debugger;

  const [currentSurvey, setCurrentSurvey] = useState(
    currentTopic.surveysrequests ? currentTopic.surveysrequests[0] : null
  );

  function handleChanges(value) {
    let surveyIndex = value.charAt(value.length - 1);
    setCurrentSurvey(currentTopic.surveysrequests[surveyIndex]);
  }

  function changeTopic(topic) {
    getTopicById(props.getCurrentTopic, topic.topicId);
    setCurrentSurvey(topic.surveysrequests[0]);
  }

  return (
    <>
      <Layout style={{ height: '100vh', backgroundColor: '#BC9D7E' }}>
        <Sider
          style={{
            backgroundColor: '#0C5274',
            borderTopRightRadius: '2rem',
            borderBottomRightRadius: '2rem',
            overflow: 'scroll',
          }}
        >
          <h2 style={{ color: '#BC9D7E', marginTop: '1rem' }}>Topics</h2>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            <TopicCreation />
            <JoinTopic />
          </div>
          <div
            style={{
              display: 'flex',
              flexFlow: 'column',
              alignItems: 'center',
            }}
          >
            {props.topics &&
              props.topics.map(topic => {
                return (
                  <Button
                    key={topic.topicId}
                    onClick={() => changeTopic(topic)}
                    style={{
                      backgroundColor: '#BC9D7E',
                      border: '1px solid #191919',
                      borderRadius: '1rem',
                      fontWeight: 'bold',
                      color: '#191919',
                      margin: '1rem',
                    }}
                  >
                    {topic.title}
                  </Button>
                );
              })}
          </div>
        </Sider>
        <Layout style={{ backgroundColor: '#BC9D7E' }}>
          <PageHeader
            className="header"
            title={<h1>Apollo</h1>}
            subTitle={`Hello, ${props.userInfo.name}`}
            style={{
              backgroundColor: '#BC9D7E',
              padding: '2rem',
            }}
            extra={[
              // this is the user profile icon
              <UserOutlined
                key="4"
                style={{
                  fontSize: '30px',
                  border: '1px solid #191919',
                  borderRadius: '2rem',
                  padding: '.5rem',
                }}
              />,
              <Button
                key="3"
                onClick={() => authService.logout()}
                style={{
                  backgroundColor: '#191919',
                  border: '1px solid #BC9D7E',
                  fontWeight: 'bold',
                  color: '#BC9D7E',
                  borderRadius: '1rem',
                }}
              >
                Sign Out
              </Button>,
            ]}
          ></PageHeader>
          <Layout
            style={{
              display: 'flex',
              flexFlow: 'row',
              backgroundColor: '#BC9D7E',
            }}
          >
            <Content
              style={{
                backgroundColor: '#BC9D7E',
                textAlign: 'left',
                marginLeft: '2rem',
              }}
            >
              <h2 style={{ textAlign: 'left' }}>
                {props.currentTopic && props.currentTopic.title}
              </h2>
              <Select
                placeholder="Select a Request"
                defaultValue={`Request ${currentSurvey &&
                  currentSurvey.surveyId}`}
                onChange={handleChanges}
              >
                {currentTopic.surveysrequests &&
                  currentTopic.surveysrequests.map((request, idx) => {
                    return (
                      <Option key={`Request-${idx}`}>
                        Request {request.surveyId}
                      </Option>
                    );
                  })}
              </Select>
              {props.currentTopic.owner &&
              props.currentTopic.owner.username === props.userInfo.email ? (
                <SendButton />
              ) : (
                <RespondButton />
              )}
              <h3 style={{ textAlign: 'left' }}>CONTEXT</h3>
              <p style={{ textAlign: 'left' }}>
                Context Questions and answers go here.
              </p>
            </Content>
            <Content>
              {currentSurvey && (
                <ResponseList
                  questions={currentSurvey.questions.filter(q => !q.leader)}
                />
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
}

const mapStateToProps = state => {
  return {
    userInfo: state.userInfo,
    topics: state.topics,
    currentTopic: state.currentTopic,
  };
};

export default connect(mapStateToProps, { getCurrentTopic })(RenderHomePage);
