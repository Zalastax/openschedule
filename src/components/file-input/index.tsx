import * as React from 'react'

// Inspired by https://github.com/ngokevin/react-file-reader-input

// Remember to get the result via ProgressEvent.target.result

interface FileInputProps {
  as: 'binary' | 'buffer' | 'text' | 'url'
  onChange: (e: React.FormEvent<HTMLInputElement>, zippedResults: [ProgressEvent, File][]) => void
}

function arrayify(files: FileList | null) {
  if (files == null) {
    return  []
  }
  return Array.from(files)
}

export default class FileInput extends React.Component<FileInputProps, void> {
  public handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const files = arrayify(e.currentTarget.files)

    // Build Promise List, each promise resolved by FileReader.onload.
    Promise.all(files.map(file => new Promise<[ProgressEvent, File]>((resolve, _reject) => {
      let reader = new FileReader()

      reader.onload = (result: ProgressEvent) => {
        // Resolve both the FileReader result and its original file.
        resolve([result, file])
      }

      // Read the file with format based on this.props.as.
      switch ((this.props.as || 'url')) {
        case 'binary': {
          reader.readAsBinaryString(file)
          break
        }
        case 'buffer': {
          reader.readAsArrayBuffer(file)
          break
        }
        case 'text': {
          reader.readAsText(file)
          break
        }
        case 'url': {
          reader.readAsDataURL(file)
          break
        }
        default:
      }
    })))
    .then(zippedResults => this.props.onChange(e, zippedResults))
  }

  public render() {
    return <input type='file' onChange={this.handleChange} />
  }
}
