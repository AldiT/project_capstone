import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/videos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditVideoProps {
  match: {
    params: {
      videoId: string
    }
  }
  auth: Auth
}

interface EditVideoState {
  file: any
  uploadState: UploadState
}

export class EditVideo extends React.PureComponent<
  EditVideoProps,
  EditVideoState
> {
  state: EditVideoState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.videoId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new video</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="video/mp4,video/x-m4v,video/*"
              placeholder="Video to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading video metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
