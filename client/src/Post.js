import {format} from "date-fns";

export default function Post({title, summary, cover, content, createdAt}) {

    return (
        <div className="post">
        <div className="image">
          <img src="https://techcrunch.com/wp-content/uploads/2019/09/alexa-echo-amazon-9250064.jpg?resize=768,512" alt="Alexa" />
        </div>
        <div className="texts">
          <h2>{title}</h2>
          <p className="info">
            <a className="author">Rohan Paul</a>
            <time>{format(new Date(createdAt), 'MMM dd, yyyy hh:mm aaaa')}</time>
          </p>
          <p className="summary">{summary}</p>
        </div>
      </div>
    )
};