import React, { useState } from "react";
import styles from "@/app/page.module.css";
import { Dropdown } from "react-bootstrap";

export default function Members({ members, me }) {
  const [showMembers, setShowMembers] = useState(false);

  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  const onlineMembers = members.filter(
    (m) => m.clientData && m.clientData.name
  );

  return (
    <div className={styles.members}>
      <Dropdown show={showMembers} onToggle={toggleMembers}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {onlineMembers.length} user{onlineMembers.length === 1 ? "" : "s"}{" "}
          online
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {showMembers &&
            onlineMembers.map((m) => (
              <Dropdown.Item key={m.id}>
                <Member {...m} isMe={m.id === me.id} />
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

function Member({ id, clientData, isMe }) {
  if (!clientData || !clientData.name) {
    // Handle the case when clientData or name is undefined or null
    return null;
  }

  const { color, name } = clientData;

  return (
    <div key={id} className="member-inline">
      <div className={styles.avatar} style={{ backgroundColor: color }} />
      <div className={styles.username}>
        {name} {isMe ? " (you)" : ""}
      </div>
    </div>
  );
}
