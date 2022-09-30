//import dateFormat from 'dateformat'
import { History } from 'history'
//import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Checkbox
} from 'semantic-ui-react'
import { VideoPlayer } from './VideoPlayer'

import { createVideo, deleteVideo, getVideos, patchVideo } from '../api/videos-api'
import Auth from '../auth/Auth'
import { Video } from '../types/Video'

interface VideosProps {
  auth: Auth
  history: History
}

interface VideosState {
  videos: Video[]
  newVideoName: string
  loadingVideos: boolean
  newVideoPublic: string
}

export class Videos extends React.PureComponent<VideosProps, VideosState> {
  state: VideosState = {
    videos: [],
    newVideoName: '',
    loadingVideos: true,
    newVideoPublic: 'n'
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVideoName: event.target.value })
  }

  onEditButtonClick = (videoId: string) => {
    this.props.history.push(`/videos/${videoId}/edit`)
  }

  onVideoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newVideo = await createVideo(this.props.auth.getIdToken(), {
          name: this.state.newVideoName,
          publicVideo: this.state.newVideoPublic
      })
      this.setState({
        videos: [...this.state.videos, newVideo],
        newVideoName: ''
      })
    } catch (e){
      console.log(e)
      alert('Video creation failed')
    }
  }

  onVideoDelete = async (videoId: string) => {
    try {
      await deleteVideo(this.props.auth.getIdToken(), videoId)
      this.setState({
        videos: this.state.videos.filter(video => video.videoId !== videoId)
      })
    } catch {
      alert('Video deletion failed')
    }
  }

  onVideoCheck = async (pos: number) => {
    try {
      const video = this.state.videos[pos]
      await patchVideo(this.props.auth.getIdToken(), video.videoId, {
        name: video.name,
        publicVideo: 'n'
      })
    } catch {
      alert('Video deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const videos = await getVideos(this.props.auth.getIdToken())
      this.setState({
        videos,
        loadingVideos: false
      })
    } catch (e) {
      alert(`Failed to fetch videos: ${(e as Error).message}`)
    }
  }

  renderPublicVideoCheckbox(){
    return (
      <Grid.Column width={2}>
        <Checkbox 
          name = "newVideoPublic"
          ref = "newVideoPublic"
          toggle
          label="Public"
          onClick={(event: React.FormEvent<HTMLInputElement>) => {
            if (this.state.newVideoPublic === 'y')
              this.setState({
                newVideoPublic: 'n'
              })
            else
              this.setState({
                newVideoPublic: 'y'
              })
          }}
        />
      </Grid.Column>
    );
  }

  render() {
    return (
      <div>
        <Header as="h1">Videos</Header>

        {this.renderCreateVideoInput()}

        {this.renderVideos()}
      </div>
    )
  }

  renderCreateVideoInput() {
    return (
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column width={14}>
            <Input
              action={{
                color: 'teal',
                labelPosition: 'left',
                icon: 'add',
                content: 'New post',
                onClick: this.onVideoCreate
              }}
              fluid
              actionPosition="left"
              placeholder="Whats on your mind..."
              onChange={this.handleNameChange}
            />
          </Grid.Column>
          <Grid.Column width={2}>
              {this.renderPublicVideoCheckbox()}
          </Grid.Column>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderVideos() {
    if (this.state.loadingVideos) {
      return this.renderLoading()
    }

    return this.renderVideosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Videos
        </Loader>
      </Grid.Row>
    )
  }

  renderVideoPlayer(video: Video){
    console.log(video)
    if (video.videoUrl)
      return (
        <Grid.Row centered>    
          <VideoPlayer videoUrl={video.videoUrl}/>
        </Grid.Row>
      );
  }

  renderVideosList() {
    return (
      <Grid centered>
        {this.state.videos.map((video, pos) => {
          return (
            <Grid.Row key={video.videoId}>
              {this.renderVideoPlayer(video)}
              <Grid.Column width={1} verticalAlign="middle">
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {video.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(video.videoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVideoDelete(video.videoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {video.videoUrl && (
                <Image src={video.videoUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
