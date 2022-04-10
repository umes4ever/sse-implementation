package com.umes4ever.sseimplementation.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;

import com.umes4ever.sseimplementation.dto.Message;

import reactor.core.publisher.Flux;

@Service
public class SSEService {

	private static final String NO_MESSAGE_TEXT = "No message yet !";

	List<String> users = new ArrayList<>();
	Map<String, List<Message>> messageForMap = new HashMap<>();

	public void addUser(String name) {
		if (!users.contains(name)) {
			users.add(name);

			List<Message> messageForNewUser = new ArrayList<>();
			users.stream().forEach(u -> {
				List<Message> messages = messageForMap.get(u);

				if (messages != null) {
					messageForMap.get(u).add(new Message(name, u, NO_MESSAGE_TEXT));
					messageForNewUser.add(new Message(u, name, NO_MESSAGE_TEXT));
				} else {
					messageForNewUser.add(new Message(name, u, NO_MESSAGE_TEXT));
				}
			});

			messageForMap.put(name, messageForNewUser);
		}
	}

	public void sendUserMessage(Message message) {
		if (users.contains(message.getFrom()) && users.contains(message.getTo())) {
			List<Message> messagesTo = messageForMap.get(message.getTo());
			List<Message> messagesFrom = messageForMap.get(message.getFrom());

			// Remove "No message yet !" message for "from" user
			List<Message> newMessagesTo = new ArrayList<>();
			messagesTo.stream().forEach(m -> {
				if (m.getFrom().equals(message.getFrom()) && m.getMessage().equals(NO_MESSAGE_TEXT)) {
					return;
				}

				if (m.getFrom().equals(m.getTo()) && m.getMessage().equals(NO_MESSAGE_TEXT)) {
					return;
				}

				newMessagesTo.add(m);
			});

			// Remove "No message yet !" message for "to" user
			List<Message> newMessagesFrom = new ArrayList<>();
			messagesFrom.stream().forEach(m -> {
				if (m.getFrom().equals(message.getTo()) && m.getMessage().equals(NO_MESSAGE_TEXT)) {
					return;
				}

				if (m.getFrom().equals(m.getTo()) && m.getMessage().equals(NO_MESSAGE_TEXT)) {
					return;
				}

				newMessagesFrom.add(m);
			});

			messageForMap.get(message.getTo()).clear();
			messageForMap.get(message.getFrom()).clear();

			newMessagesTo.add(message);
			newMessagesFrom.add(message);

			messageForMap.get(message.getTo()).addAll(newMessagesTo);
			messageForMap.get(message.getFrom()).addAll(newMessagesFrom);
		}
	}

	public Flux<ServerSentEvent<List<String>>> getUsers(String name) {
		if (name != null && !name.isBlank()) {
			return Flux.interval(Duration.ofSeconds(1))
					.map(sequence -> ServerSentEvent.<List<String>>builder().id(String.valueOf(sequence))
							.event("user-list-event").data(users.stream().filter(u -> !u.equals(name)).toList())
							.build());
		}

		return Flux.interval(Duration.ofSeconds(1)).map(sequence -> ServerSentEvent.<List<String>>builder()
				.id(String.valueOf(sequence)).event("user-list-event").data(new ArrayList<>()).build());
	}

	public Flux<ServerSentEvent<Message>> getLastUserMessage(String name) {
		if (name != null && !name.isBlank()) {
			List<Message> messages = messageForMap.get(name);
			return Flux.interval(Duration.ofSeconds(1))
					.map(sequence -> ServerSentEvent.<Message>builder().id(String.valueOf(sequence))
							.event("last-message-event").data(messages.get(messages.size() - 1)).build());
		}

		return Flux.interval(Duration.ofSeconds(1)).map(sequence -> ServerSentEvent.<Message>builder()
				.id(String.valueOf(sequence)).event("last-message-event").data(null).build());
	}

	public Flux<ServerSentEvent<List<Message>>> getAllUserMessages(String name) {
		if (name != null && !name.isBlank()) {
			List<Message> messages = messageForMap.get(name);
			return Flux.interval(Duration.ofSeconds(1)).map(sequence -> ServerSentEvent.<List<Message>>builder()
					.id(String.valueOf(sequence)).event("all-message-event").data(messages).build());
		}

		return Flux.interval(Duration.ofSeconds(1)).map(sequence -> ServerSentEvent.<List<Message>>builder()
				.id(String.valueOf(sequence)).event("all-message-event").data(new ArrayList<>()).build());
	}

}
