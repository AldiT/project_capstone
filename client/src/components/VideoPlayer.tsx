import * as React from 'react'


interface VideoPlayerProps {
    videoUrl: string
}

interface VideoPlayerState {

}

export class VideoPlayer extends React.PureComponent<VideoPlayerProps, VideoPlayerState> {
    state: VideoPlayerState = {}

    render () {
        return (
            <video controls width="60%">
              <source src={this.props.videoUrl} type="video/mp4"
          className="slider"/>
              Sorry, your browser doesn't support embedded videos.
            </video>
          );
    }

}

