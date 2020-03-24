import React, { Component } from 'react';
import {
  Person,
} from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      newJobLog:"",
      jobLogIndex:0,
      isLoading:true,
      jobLogs: []
  	};
  }

  handleNewJobLogChange(event) {
    this.setState({newJobLog: event.target.value})
  }

  handleNewJobLogSubmit(event) {
    this.saveNewStatus(this.state.newJobLog)
    this.setState({
      newJobLog: ""
    })
  }

  saveNewStatus(jobLogText) {
    const { userSession } = this.props
    let jobLogs = this.state.jobLogs

    let jobLog = {
      id: this.state.jobLogIndex++,
      log: jobLogText.trim(),
      created_at: Date.now()
    }

    jobLogs.unshift(jobLog)
    const options = { encrypt: false }
    userSession.putFile('jobLogs.json', JSON.stringify(jobLogs), options)
      .then(() => {
        this.setState({
          jobLogs: jobLogs
        })
      })
  }

  fetchData() {
    const { userSession } = this.props
    this.setState({ isLoading: true })
    const options = { decrypt: false }
    userSession.getFile('jobLogs.json', options)
      .then((file) => {
        var jobLogs = JSON.parse(file || '[]')
        this.setState({
          person: new Person(userSession.loadUserData().profile),
          username: userSession.loadUserData().username,
          statusIndex: jobLogs.length,
          jobLogs: jobLogs,
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    return (
      !userSession.isSignInPending() ?
      <div className="panel-welcome" id="section-2">
        <div className="avatar-section">
          <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" alt=""/>

          <h1>你好, <span id="heading-name">{ person.name() ? person.name() : 'Nameless Person' }</span>!</h1>
          <br/>
          <br/>

          <p className="lead">
            <button
              className="btn btn-primary btn-lg"
              id="signout-button"
              onClick={ handleSignOut.bind(this) }
            >
              退出当前账号
            </button>
          </p>
        </div>
        <div className="new-jobLog">
          <div className="col-md-12">
               <textarea className="input-log"
                         value={this.state.newJobLog}
                         onChange={e => this.handleNewJobLogChange(e)}
                         placeholder="输入今日工作事项"
               />
          </div>
          <div className="col-md-12">
            <button
              className="btn btn-primary btn-lg"
              onClick={e => this.handleNewJobLogSubmit(e)}
            >
              提交
            </button>
          </div>
        </div>
        <div className="col-md-12 jobLogs">
          {this.state.isLoading && <span>Loading...</span>}
          {this.state.jobLogs.map((jobLog) => (
              <div className="logItem" key={jobLog.id}>
                {jobLog.log} 创建于:{jobLog.created_at}
              </div>
            )
          )}
        </div>
      </div> : null
    );
  }

  componentWillMount() {
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile),

    });
  }

  componentDidMount() {
    this.fetchData()
  }
}
